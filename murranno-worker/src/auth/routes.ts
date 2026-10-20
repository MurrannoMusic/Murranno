import { Hono, type Context } from 'hono';
import type { AppEnv } from '../env';
import { hashSecret, verifySecret } from '../lib/crypto';
import { DB, now, uuid } from '../lib/db';
import { sendEmail, sendEmailSafe, templates } from '../lib/email';
import { safeRedirect, withinLimit } from '../lib/guard';
import { clientIp, readJson } from '../lib/http';
import { oauthRoutes } from './oauth';
import {
  assertNotBanned,
  authError,
  createSession,
  getAuthUser,
  getAuthUserByEmail,
  provisionStatements,
  refreshSession,
  resolveAuth,
  toGoTrueUser,
  type AuthUserRow,
} from './session';
import { consumeCode, consumeLink, issueToken, verifyLink, type TokenType } from './tokens';

export const authRoutes = new Hono<AppEnv>();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;
const RECOVERY_WINDOW_MS = 3600_000;

const db = (c: Context<AppEnv>) => new DB(c.env.DB);

async function limit(c: Context<AppEnv>, scope: string, subject = '') {
  if (!(await withinLimit(c.env, `${scope}:${clientIp(c.req.raw)}:${subject.toLowerCase()}`))) {
    throw authError(429, 'over_request_rate_limit', 'Request rate limit reached');
  }
}

async function requireUser(c: Context<AppEnv>) {
  const auth = await resolveAuth(c.env, db(c), c.req.raw);
  if (!auth) throw authError(401, 'no_authorization', 'Invalid JWT');
  const u = await getAuthUser(db(c), auth.userId);
  if (!u) throw authError(404, 'user_not_found', 'User not found');
  return { auth, u };
}

async function sendConfirmation(c: Context<AppEnv>, u: AuthUserRow, redirectTo: string) {
  const { code, link } = await issueToken(db(c), u.id, 'signup');
  await sendEmail(c.env, u.email, 'Verify your Murranno Music account', templates.confirmSignup(u.email, code, verifyLink(c.req.raw, link, 'signup', redirectTo)));
}

let dummyHash: Promise<string> | undefined;
/** A real hash to verify against when the email is unknown (created lazily: no crypto at global scope). */
const timingDummy = () => (dummyHash ??= hashSecret('murranno-timing-equaliser'));

/** Tell the current address about sensitive account changes (credential changes don't need the old password). */
function securityNotice(c: Context<AppEnv>, to: string, subject: string, message: string) {
  c.executionCtx.waitUntil(sendEmailSafe(c.env, to, subject, templates.broadcast(subject, message)));
}

function sendWelcome(c: Context<AppEnv>, u: AuthUserRow) {
  const name = (u.raw_user_meta_data?.full_name as string) || (u.raw_user_meta_data?.first_name as string) || 'there';
  c.executionCtx.waitUntil(sendEmailSafe(c.env, u.email, 'Welcome to Murranno Music! 🎵', templates.welcome(c.env.APP_URL, name, 'artist')));
}

/** Apply a verified one-time token: confirm signup / swap email. Returns the (updated) user. */
async function applyToken(c: Context<AppEnv>, userId: string, type: TokenType, newEmail: string | null) {
  const d = db(c);
  const ts = now();
  if (type === 'signup') {
    const before = await getAuthUser(d, userId);
    await d.batch([
      d.stmt('UPDATE auth_users SET email_confirmed_at = COALESCE(email_confirmed_at, ?), updated_at = ? WHERE id = ?', ts, ts, userId),
      // Provider logins attached before the inbox owner confirmed can't be trusted to be theirs.
      ...(before && !before.email_confirmed_at ? [d.stmt('DELETE FROM auth_identities WHERE user_id = ?', userId)] : []),
    ]);
    if (before && !before.email_confirmed_at) sendWelcome(c, before);
  } else if (type === 'email_change' && newEmail) {
    if (await getAuthUserByEmail(d, newEmail)) throw authError(422, 'email_exists', 'A user with this email address has already been registered');
    await d.batch([
      d.stmt('UPDATE auth_users SET email = ?, email_confirmed_at = ?, updated_at = ? WHERE id = ?', newEmail, ts, ts, userId),
      d.stmt('UPDATE profiles SET email = ?, updated_at = ? WHERE id = ?', newEmail, ts, userId),
    ]);
  } else if (type === 'recovery') {
    // A recovery link proves inbox access, so it also confirms the address. If the account was never
    // confirmed, its password may belong to someone who squatted the email: drop it and its sessions.
    const before = await getAuthUser(d, userId);
    if (before && !before.email_confirmed_at) {
      await d.batch([
        d.stmt('UPDATE auth_users SET email_confirmed_at = ?, encrypted_password = NULL, updated_at = ? WHERE id = ?', ts, ts, userId),
        d.stmt('UPDATE auth_sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL', ts, userId),
      ]);
    }
  }
  const u = await getAuthUser(d, userId);
  if (!u) throw authError(404, 'user_not_found', 'User not found');
  await assertNotBanned(d, u);
  return u;
}

function hashFragment(session: Record<string, any>, type: string) {
  const p = new URLSearchParams({
    access_token: session.access_token,
    expires_at: String(session.expires_at),
    expires_in: String(session.expires_in),
    refresh_token: session.refresh_token,
    token_type: 'bearer',
    type,
  });
  return p.toString();
}

// ---------------------------------------------------------------- signup ----

authRoutes.post('/signup', async (c) => {
  const body = await readJson(c.req.raw);
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const meta = (body.data && typeof body.data === 'object' ? body.data : {}) as Record<string, unknown>;
  const redirectTo = safeRedirect(c.env, c.req.query('redirect_to'));
  await limit(c, 'signup', email);

  if (!EMAIL_RE.test(email)) throw authError(400, 'validation_failed', 'Unable to validate email address: invalid format');
  if (password.length < MIN_PASSWORD) throw authError(422, 'weak_password', `Password should be at least ${MIN_PASSWORD} characters.`);

  const d = db(c);
  const existing = await getAuthUserByEmail(d, email);
  if (existing?.email_confirmed_at) throw authError(422, 'user_already_exists', 'User already registered');
  if (existing) {
    // Unconfirmed retry. Never adopt the new password: anyone can submit this form for any address,
    // and whoever later confirms from the inbox would inherit it. Same password = a genuine retry, so
    // just resend. A different one means two people claim the address: drop the password and any
    // sessions, so the inbox owner confirms and then sets their own via "Forgot password".
    if (!(await verifySecret(password, existing.encrypted_password))) {
      const ts = now();
      await d.batch([
        d.stmt('UPDATE auth_users SET encrypted_password = NULL, updated_at = ? WHERE id = ?', ts, existing.id),
        d.stmt('UPDATE auth_sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL', ts, existing.id),
      ]);
    }
    const u = (await getAuthUser(d, existing.id))!;
    await sendConfirmation(c, u, redirectTo);
    return c.json(await toGoTrueUser(d, u));
  }

  const id = uuid();
  await d.batch([
    await d.insertStmt('auth_users', {
      id,
      email,
      encrypted_password: await hashSecret(password),
      raw_user_meta_data: meta,
      raw_app_meta_data: { provider: 'email', providers: ['email'] },
    }),
    ...(await provisionStatements(d, id, email, meta)),
  ]);
  const u = (await getAuthUser(d, id))!;
  await sendConfirmation(c, u, redirectTo);
  return c.json(await toGoTrueUser(d, u));
});

authRoutes.post('/resend', async (c) => {
  const body = await readJson(c.req.raw);
  const email = String(body.email ?? '').trim();
  await limit(c, 'resend', email);
  const u = email ? await getAuthUserByEmail(db(c), email) : null;
  if (u && !u.email_confirmed_at && (body.type ?? 'signup') === 'signup') {
    await sendConfirmation(c, u, safeRedirect(c.env, c.req.query('redirect_to') ?? body.options?.emailRedirectTo));
  }
  return c.json({}); // same answer either way: no account enumeration
});

// ----------------------------------------------------------------- token ----

authRoutes.post('/token', async (c) => {
  const grant = c.req.query('grant_type');
  const body = await readJson(c.req.raw);
  const d = db(c);

  if (grant === 'refresh_token') return c.json(await refreshSession(c.env, d, c.req.raw, String(body.refresh_token ?? '')));
  if (grant !== 'password') throw authError(400, 'unsupported_grant_type', 'Unsupported grant type');

  const email = String(body.email ?? '').trim();
  await limit(c, 'login', email);
  const u = email ? await getAuthUserByEmail(d, email) : null;
  // Hash even for unknown emails so response time doesn't reveal which accounts exist.
  const ok = await verifySecret(String(body.password ?? ''), u?.encrypted_password ?? (await timingDummy()));
  if (!u || !ok) throw authError(400, 'invalid_credentials', 'Invalid login credentials');
  if (!u.email_confirmed_at) throw authError(400, 'email_not_confirmed', 'Email not confirmed');
  await assertNotBanned(d, u);
  return c.json(await createSession(c.env, d, c.req.raw, u, 'password'));
});

// ---------------------------------------------------------------- verify ----

authRoutes.post('/verify', async (c) => {
  const body = await readJson(c.req.raw);
  const d = db(c);
  const type = String(body.type ?? '') as TokenType | 'email' | 'magiclink';
  let row;
  if (body.token_hash) {
    row = await consumeLink(d, String(body.token_hash));
  } else {
    const email = String(body.email ?? '').trim();
    await limit(c, 'verify', email);
    const types: TokenType[] = type === 'recovery' ? ['recovery'] : type === 'email_change' ? ['email_change'] : ['signup'];
    let user = await getAuthUserByEmail(d, email);
    if (!user && type === 'email_change') {
      // verifyOtp({ type: 'email_change', email: <new address> })
      const owner = await d.first('auth_tokens', "SELECT user_id FROM auth_tokens WHERE type = 'email_change' AND new_email = ? COLLATE NOCASE", email);
      user = owner ? await getAuthUser(d, owner.user_id) : null;
    }
    if (!user) throw authError(403, 'otp_expired', 'Token has expired or is invalid');
    row = await consumeCode(d, user.id, types, String(body.token ?? ''));
  }
  const u = await applyToken(c, row.user_id, row.type, row.new_email);
  return c.json(await createSession(c.env, d, c.req.raw, u, row.type === 'recovery' ? 'recovery' : 'otp'));
});

/** Email links land here, then bounce to the app with the session in the URL hash (implicit flow). */
authRoutes.get('/verify', async (c) => {
  const redirectTo = safeRedirect(c.env, c.req.query('redirect_to'));
  const d = db(c);
  try {
    const row = await consumeLink(d, c.req.query('token') ?? '');
    const u = await applyToken(c, row.user_id, row.type, row.new_email);
    const session = await createSession(c.env, d, c.req.raw, u, row.type === 'recovery' ? 'recovery' : 'otp');
    return c.redirect(`${redirectTo}#${hashFragment(session, row.type)}`, 303);
  } catch (e: any) {
    const p = new URLSearchParams({ error: 'access_denied', error_code: e?.extra?.error_code ?? 'otp_expired', error_description: e?.message ?? 'Link is invalid or has expired' });
    return c.redirect(`${redirectTo}#${p}`, 303);
  }
});

// ---------------------------------------------------------------- recover ---

authRoutes.post('/recover', async (c) => {
  const body = await readJson(c.req.raw);
  const email = String(body.email ?? '').trim();
  await limit(c, 'recover', email);
  const u = email ? await getAuthUserByEmail(db(c), email) : null;
  if (u) {
    const redirectTo = safeRedirect(c.env, c.req.query('redirect_to'));
    const { code, link } = await issueToken(db(c), u.id, 'recovery');
    await sendEmail(c.env, u.email, 'Reset your Murranno Music password', templates.recovery(code, verifyLink(c.req.raw, link, 'recovery', redirectTo)));
  }
  return c.json({});
});

// ------------------------------------------------------------------ user ----

authRoutes.get('/user', async (c) => {
  const { u } = await requireUser(c);
  return c.json(await toGoTrueUser(db(c), u));
});

authRoutes.put('/user', async (c) => {
  const { auth, u } = await requireUser(c);
  const body = await readJson(c.req.raw);
  const d = db(c);
  const ts = now();

  // Credential changes need the current password, except right after a password-reset link/code
  // (that session proved inbox ownership) or for accounts without a password (Google/Apple only).
  const changingEmail = body.email !== undefined && String(body.email).trim().toLowerCase() !== u.email.toLowerCase();
  const freshRecovery = auth.sessionMethod === 'recovery' && Date.now() - Date.parse(auth.sessionCreatedAt) < RECOVERY_WINDOW_MS;
  if ((body.password !== undefined || changingEmail) && u.encrypted_password && !freshRecovery) {
    await limit(c, 'reauth', u.email);
    if (!(await verifySecret(String(body.current_password ?? ''), u.encrypted_password))) {
      throw authError(400, 'reauthentication_needed', 'Current password is incorrect');
    }
  }

  if (body.password !== undefined) {
    const password = String(body.password);
    if (password.length < MIN_PASSWORD) throw authError(422, 'weak_password', `Password should be at least ${MIN_PASSWORD} characters.`);
    if (await verifySecret(password, u.encrypted_password)) {
      throw authError(422, 'same_password', 'New password should be different from the old password.');
    }
    // Changing the password signs out every other device.
    await d.batch([
      d.stmt('UPDATE auth_users SET encrypted_password = ?, updated_at = ? WHERE id = ?', await hashSecret(password), ts, u.id),
      d.stmt('UPDATE auth_sessions SET revoked_at = ? WHERE user_id = ? AND id != ? AND revoked_at IS NULL', ts, u.id, auth.sessionId),
    ]);
    securityNotice(c, u.email, 'Your Murranno password was changed', 'The password for your account was just changed. If this was not you, reset your password immediately and contact support.');
  }
  if (body.data && typeof body.data === 'object') {
    await d.update('auth_users', { raw_user_meta_data: { ...(u.raw_user_meta_data ?? {}), ...body.data } }, 'id = ?', u.id);
  }
  let newEmail: string | undefined;
  if (changingEmail) {
    newEmail = String(body.email).trim().toLowerCase();
    if (!EMAIL_RE.test(newEmail)) throw authError(400, 'validation_failed', 'Unable to validate email address: invalid format');
    if (await getAuthUserByEmail(d, newEmail)) throw authError(422, 'email_exists', 'A user with this email address has already been registered');
    const { code, link } = await issueToken(d, u.id, 'email_change', newEmail);
    const redirectTo = safeRedirect(c.env, c.req.query('redirect_to'));
    await sendEmail(c.env, newEmail, 'Confirm your new email address', templates.emailChange(code, verifyLink(c.req.raw, link, 'email_change', redirectTo)));
    securityNotice(c, u.email, 'Email change requested on your Murranno account', `Someone asked to change your account email to ${newEmail}. If this was not you, reset your password immediately and contact support.`);
  }
  const user = await toGoTrueUser(d, (await getAuthUser(d, u.id))!);
  return c.json(newEmail ? { ...user, new_email: newEmail, email_change_sent_at: ts } : user);
});

authRoutes.post('/logout', async (c) => {
  const auth = await resolveAuth(c.env, db(c), c.req.raw);
  if (auth) {
    const scope = c.req.query('scope') ?? 'global';
    const ts = now();
    const tokenSession = "COALESCE(json_extract(device_info, '$.session_id'), '')";
    const tokenWhere = scope === 'local' ? ` AND ${tokenSession} = ?` : scope === 'others' ? ` AND ${tokenSession} != ?` : '';
    await db(c).run(`UPDATE push_notification_tokens SET is_active = 0 WHERE user_id = ?${tokenWhere}`, auth.userId, ...(tokenWhere ? [auth.sessionId] : []));
    if (scope === 'local') await db(c).run('UPDATE auth_sessions SET revoked_at = ? WHERE id = ?', ts, auth.sessionId);
    else if (scope === 'others') await db(c).run('UPDATE auth_sessions SET revoked_at = ? WHERE user_id = ? AND id != ?', ts, auth.userId, auth.sessionId);
    else await db(c).run('UPDATE auth_sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL', ts, auth.userId);
  }
  return c.body(null, 204);
});

authRoutes.route('/', oauthRoutes);
