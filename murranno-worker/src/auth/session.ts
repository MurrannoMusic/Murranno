import type { AuthContext, Env } from '../env';
import { randomToken, sha256Hex, signJwt, verifyJwt } from '../lib/crypto';
import { DB, now, uuid, type Row } from '../lib/db';
import { clientIp, HttpError } from '../lib/http';

export const ACCESS_TTL_SECONDS = 3600;
/** Window in which a just-rotated refresh token is still accepted (parallel tabs/requests). */
const REUSE_GRACE_MS = 10_000;

export interface AuthUserRow {
  id: string;
  email: string;
  encrypted_password: string | null;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  raw_user_meta_data: Row | null;
  raw_app_meta_data: Row | null;
  banned_until: string | null;
  created_at: string;
  updated_at: string;
}

/** GoTrue-compatible error body (auth-js reads `error_code` and `msg`). */
export function authError(status: number, code: string, msg: string): HttpError {
  return new HttpError(status, msg, { __auth: true, code: status, error_code: code, msg });
}

export async function getAuthUser(db: DB, id: string) {
  return db.first<AuthUserRow>('auth_users', 'SELECT * FROM auth_users WHERE id = ?', id);
}

export async function getAuthUserByEmail(db: DB, email: string) {
  return db.first<AuthUserRow>('auth_users', 'SELECT * FROM auth_users WHERE email = ? COLLATE NOCASE', email.trim());
}

export async function toGoTrueUser(db: DB, u: AuthUserRow) {
  const identities = await db.all('auth_identities', 'SELECT * FROM auth_identities WHERE user_id = ?', u.id);
  const providers = identities.length ? [...new Set(identities.map((i) => i.provider))] : ['email'];
  return {
    id: u.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: u.email,
    email_confirmed_at: u.email_confirmed_at,
    confirmed_at: u.email_confirmed_at,
    phone: '',
    last_sign_in_at: u.last_sign_in_at,
    app_metadata: { provider: providers[0], providers, ...(u.raw_app_meta_data ?? {}) },
    user_metadata: u.raw_user_meta_data ?? {},
    identities: identities.map((i) => ({
      id: i.provider_id,
      identity_id: i.id,
      user_id: i.user_id,
      provider: i.provider,
      identity_data: i.identity_data ?? {},
      created_at: i.created_at,
      updated_at: i.updated_at,
      last_sign_in_at: i.updated_at,
    })),
    created_at: u.created_at,
    updated_at: u.updated_at,
    is_anonymous: false,
  };
}

/** Rows every new account needs (previously created by Supabase's handle_new_user trigger). */
export async function provisionStatements(db: DB, userId: string, email: string, meta: Row) {
  const trialEnds = new Date(Date.now() + 14 * 86400_000).toISOString();
  const full = (meta.full_name as string) || [meta.first_name, meta.last_name].filter(Boolean).join(' ') || null;
  return Promise.all([
    db.insertStmt('profiles', {
      id: userId,
      email,
      full_name: full,
      first_name: meta.first_name ?? null,
      last_name: meta.last_name ?? null,
      phone_number: meta.phone_number ?? meta.phone ?? null,
      avatar_url: meta.avatar_url ?? null,
    }),
    db.insertStmt('user_roles', { user_id: userId, tier: 'artist' }),
    db.insertStmt('wallet_balance', { user_id: userId }),
    db.insertStmt('notification_preferences', { user_id: userId }),
    db.insertStmt('subscriptions', {
      user_id: userId,
      tier: 'artist',
      status: 'trial',
      trial_ends_at: trialEnds,
      current_period_start: now(),
    }),
  ]);
}

async function accessToken(env: Env, req: Request, u: AuthUserRow, sessionId: string, method: string) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + ACCESS_TTL_SECONDS;
  const user = await signJwt(
    {
      aud: 'authenticated',
      exp,
      iat,
      iss: `${new URL(req.url).origin}/auth/v1`,
      sub: u.id,
      email: u.email,
      phone: '',
      app_metadata: u.raw_app_meta_data ?? {},
      user_metadata: u.raw_user_meta_data ?? {},
      role: 'authenticated',
      aal: 'aal1',
      amr: [{ method, timestamp: iat }],
      session_id: sessionId,
      is_anonymous: false,
    },
    env.JWT_SECRET,
  );
  return { token: user, exp };
}

async function sessionResponse(env: Env, db: DB, req: Request, u: AuthUserRow, sessionId: string, refresh: string, method: string) {
  const { token, exp } = await accessToken(env, req, u, sessionId, method);
  return {
    access_token: token,
    token_type: 'bearer',
    expires_in: ACCESS_TTL_SECONDS,
    expires_at: exp,
    refresh_token: refresh,
    user: await toGoTrueUser(db, u),
  };
}

export async function createSession(env: Env, db: DB, req: Request, u: AuthUserRow, method = 'password') {
  const sessionId = uuid();
  const refresh = randomToken();
  const ts = now();
  await db.batch([
    await db.insertStmt('auth_sessions', {
      id: sessionId,
      user_id: u.id,
      refresh_token_hash: await sha256Hex(refresh),
      method,
      user_agent: req.headers.get('user-agent'),
      ip: clientIp(req),
    }),
    db.stmt('UPDATE auth_users SET last_sign_in_at = ?, updated_at = ? WHERE id = ?', ts, ts, u.id),
  ]);
  return sessionResponse(env, db, req, { ...u, last_sign_in_at: ts }, sessionId, refresh, method);
}

export async function refreshSession(env: Env, db: DB, req: Request, refreshToken: string) {
  if (!refreshToken) throw authError(400, 'refresh_token_not_found', 'Invalid Refresh Token: Refresh Token Not Found');
  const h = await sha256Hex(refreshToken);
  let session = await db.first('auth_sessions', 'SELECT * FROM auth_sessions WHERE refresh_token_hash = ? AND revoked_at IS NULL', h);
  if (!session) {
    const reused = await db.first('auth_sessions', 'SELECT * FROM auth_sessions WHERE previous_token_hash = ? AND revoked_at IS NULL', h);
    const withinGrace = reused?.rotated_at && Date.now() - Date.parse(reused.rotated_at) < REUSE_GRACE_MS;
    if (reused && !withinGrace) {
      // Old token replayed after rotation: treat the session as stolen.
      await db.run('UPDATE auth_sessions SET revoked_at = ? WHERE id = ?', now(), reused.id);
      throw authError(400, 'refresh_token_already_used', 'Invalid Refresh Token: Already Used');
    }
    session = reused;
  }
  if (!session) throw authError(400, 'refresh_token_not_found', 'Invalid Refresh Token: Refresh Token Not Found');

  const u = await getAuthUser(db, session.user_id);
  if (!u) throw authError(400, 'user_not_found', 'User not found');
  await assertNotBanned(db, u);

  const next = randomToken();
  const ts = now();
  // Only rotate the token we actually matched; previous_token_hash keeps the grace window working.
  await db.run(
    `UPDATE auth_sessions SET previous_token_hash = refresh_token_hash, refresh_token_hash = ?, rotated_at = ?, updated_at = ?
     WHERE id = ?`,
    await sha256Hex(next),
    ts,
    ts,
    session.id,
  );
  return sessionResponse(env, db, req, u, session.id, next, 'token_refresh');
}

export async function assertNotBanned(db: DB, u: AuthUserRow) {
  if (u.banned_until && Date.parse(u.banned_until) > Date.now()) throw authError(400, 'user_banned', 'User is banned');
  const banned = await db.value<number>('SELECT banned FROM profiles WHERE id = ?', u.id);
  if (banned) throw authError(400, 'user_banned', 'User is banned');
}

/**
 * Resolve the caller from `Authorization: Bearer <jwt>`. Logged-out clients send the
 * publishable key instead, which is not a JWT, so they resolve to null (anonymous).
 * The session row is checked on every request so logout, password change and bans apply immediately.
 */
export async function resolveAuth(env: Env, db: DB, req: Request): Promise<AuthContext | null> {
  const header = req.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || token.split('.').length !== 3) return null;
  const claims = await verifyJwt<{ sub: string; email: string; role: string; session_id: string }>(token, env.JWT_SECRET);
  if (!claims || claims.role !== 'authenticated' || !claims.sub || !claims.session_id) return null;

  const row = await db.d1
    .prepare(
      `SELECT s.revoked_at, s.method, s.created_at, u.banned_until, p.banned, r.tier
       FROM auth_sessions s
       JOIN auth_users u ON u.id = s.user_id
       LEFT JOIN profiles p ON p.id = u.id
       LEFT JOIN user_roles r ON r.user_id = u.id
       WHERE s.id = ? AND s.user_id = ?`,
    )
    .bind(claims.session_id, claims.sub)
    .first<{ revoked_at: string | null; method: string; created_at: string; banned_until: string | null; banned: number | null; tier: string | null }>();
  if (!row || row.revoked_at) return null;
  if (row.banned || (row.banned_until && Date.parse(row.banned_until) > Date.now())) return null;

  return {
    userId: claims.sub,
    email: claims.email,
    sessionId: claims.session_id,
    tier: row.tier ?? 'artist',
    isAdmin: row.tier === 'admin',
    sessionMethod: row.method,
    sessionCreatedAt: row.created_at,
  };
}
