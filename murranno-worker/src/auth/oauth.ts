import { Hono, type Context } from 'hono';
import type { AppEnv, Env } from '../env';
import { b64url, b64urlDecode, randomToken, signJwt, timingSafeEqual, verifyJwt } from '../lib/crypto';
import { DB, now, uuid } from '../lib/db';
import { sendEmailSafe, templates } from '../lib/email';
import { safeRedirect } from '../lib/guard';
import { assertNotBanned, createSession, getAuthUser, getAuthUserByEmail, provisionStatements } from './session';

type Provider = 'google' | 'apple';

interface ProviderProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  avatar?: string;
}

export const oauthRoutes = new Hono<AppEnv>();

// State is signed with a derived key so it can never be replayed as an access token.
const stateKey = (env: Env) => `${env.JWT_SECRET}:oauth-state`;
const NONCE_COOKIE = 'murranno_oauth_nonce';
const callbackUrl = (req: Request) => new URL('/auth/v1/callback', req.url).toString();

function configured(env: Env, provider: Provider) {
  return provider === 'google'
    ? Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
    : Boolean(env.APPLE_SERVICES_ID && env.APPLE_TEAM_ID && env.APPLE_KEY_ID && env.APPLE_PRIVATE_KEY);
}

oauthRoutes.get('/authorize', async (c) => {
  const provider = c.req.query('provider') as Provider;
  const redirectTo = safeRedirect(c.env, c.req.query('redirect_to'));
  if ((provider !== 'google' && provider !== 'apple') || !configured(c.env, provider)) {
    return c.json({ code: 400, error_code: 'validation_failed', msg: 'Unsupported provider: provider is not enabled' }, 400);
  }
  const nonce = randomToken(16);
  const state = await signJwt({ provider, redirect_to: redirectTo, nonce, exp: Math.floor(Date.now() / 1000) + 600 }, stateKey(c.env));
  // Binds the flow to this browser (login-CSRF). SameSite=None: Apple returns via a cross-site POST.
  c.header('Set-Cookie', `${NONCE_COOKIE}=${nonce}; Path=/auth/v1; Max-Age=600; HttpOnly; Secure; SameSite=None`);

  const url =
    provider === 'google'
      ? new URL('https://accounts.google.com/o/oauth2/v2/auth')
      : new URL('https://appleid.apple.com/auth/authorize');
  url.searchParams.set('client_id', provider === 'google' ? c.env.GOOGLE_CLIENT_ID! : c.env.APPLE_SERVICES_ID!);
  url.searchParams.set('redirect_uri', callbackUrl(c.req.raw));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);
  if (provider === 'google') {
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('prompt', 'select_account');
  } else {
    url.searchParams.set('scope', 'name email');
    url.searchParams.set('response_mode', 'form_post'); // Apple requires form_post when asking for name/email
  }
  return c.redirect(url.toString(), 302);
});

async function handleCallback(c: Context<AppEnv>, params: URLSearchParams) {
  const state = await verifyJwt<{ provider: Provider; redirect_to: string; nonce: string }>(params.get('state') ?? '', stateKey(c.env));
  const redirectTo = safeRedirect(c.env, state?.redirect_to);
  const cookieNonce = /(?:^|;\s*)murranno_oauth_nonce=([^;]+)/.exec(c.req.header('cookie') ?? '')?.[1];
  c.header('Set-Cookie', `${NONCE_COOKIE}=; Path=/auth/v1; Max-Age=0; HttpOnly; Secure; SameSite=None`);
  const fail = (description: string) =>
    c.redirect(`${redirectTo}#${new URLSearchParams({ error: 'server_error', error_description: description })}`, 303);

  if (!state) return fail('Invalid or expired OAuth state');
  if (!cookieNonce || !timingSafeEqual(cookieNonce, state.nonce)) return fail('Sign-in must be completed in the browser that started it');
  if (params.get('error')) return fail(params.get('error_description') || params.get('error')!);
  const code = params.get('code');
  if (!code) return fail('Missing authorization code');

  try {
    const profile =
      state.provider === 'google'
        ? await googleProfile(c.env, c.req.raw, code)
        : await appleProfile(c.env, c.req.raw, code, params.get('user'));
    const d = new DB(c.env.DB);
    const user = await findOrCreateUser(c, d, state.provider, profile);
    await assertNotBanned(d, user);
    const session = await createSession(c.env, d, c.req.raw, user, 'oauth');
    const hash = new URLSearchParams({
      access_token: session.access_token,
      expires_at: String(session.expires_at),
      expires_in: String(session.expires_in),
      refresh_token: session.refresh_token,
      token_type: 'bearer',
      provider_token: '',
    });
    return c.redirect(`${redirectTo}#${hash}`, 303);
  } catch (e: any) {
    console.error('oauth callback failed', e);
    return fail(e?.message ?? 'Sign in failed');
  }
}

oauthRoutes.get('/callback', (c) => handleCallback(c, new URL(c.req.url).searchParams));
oauthRoutes.post('/callback', async (c) => handleCallback(c, new URLSearchParams(await c.req.text())));

async function findOrCreateUser(c: Context<AppEnv>, d: DB, provider: Provider, p: ProviderProfile) {
  const identity = await d.first('auth_identities', 'SELECT user_id FROM auth_identities WHERE provider = ? AND provider_id = ?', provider, p.sub);
  if (identity) {
    await d.run('UPDATE auth_identities SET updated_at = ? WHERE provider = ? AND provider_id = ?', now(), provider, p.sub);
    return (await getAuthUser(d, identity.user_id))!;
  }
  if (!p.email) throw new Error('The provider did not share an email address');
  const identityData = { sub: p.sub, email: p.email, email_verified: p.emailVerified, name: p.name, avatar_url: p.avatar };

  const existing = await getAuthUserByEmail(d, p.email);
  if (existing) {
    // Only link to an existing account when the provider vouches for the address.
    if (!p.emailVerified) throw new Error('Email not verified with provider');
    const ts = now();
    // An unconfirmed account may have been registered by someone squatting on this address:
    // the provider just proved ownership, so drop that password and any sessions it created.
    const untrusted = !existing.email_confirmed_at;
    await d.batch([
      await d.insertStmt('auth_identities', { user_id: existing.id, provider, provider_id: p.sub, identity_data: identityData }),
      untrusted
        ? d.stmt('UPDATE auth_users SET email_confirmed_at = ?, encrypted_password = NULL, updated_at = ? WHERE id = ?', ts, ts, existing.id)
        : d.stmt('UPDATE auth_users SET updated_at = ? WHERE id = ?', ts, existing.id),
      ...(untrusted ? [d.stmt('UPDATE auth_sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL', ts, existing.id)] : []),
    ]);
    return (await getAuthUser(d, existing.id))!;
  }

  const id = uuid();
  const [first, ...rest] = (p.name ?? '').split(' ');
  const meta = { full_name: p.name ?? null, first_name: first || null, last_name: rest.join(' ') || null, avatar_url: p.avatar ?? null };
  await d.batch([
    await d.insertStmt('auth_users', {
      id,
      email: p.email.toLowerCase(),
      email_confirmed_at: p.emailVerified ? now() : null,
      raw_user_meta_data: meta,
      raw_app_meta_data: { provider, providers: [provider] },
    }),
    await d.insertStmt('auth_identities', { user_id: id, provider, provider_id: p.sub, identity_data: identityData }),
    ...(await provisionStatements(d, id, p.email.toLowerCase(), meta)),
  ]);
  c.executionCtx.waitUntil(sendEmailSafe(c.env, p.email, 'Welcome to Murranno Music! 🎵', templates.welcome(c.env.APP_URL, p.name || 'there', 'artist')));
  return (await getAuthUser(d, id))!;
}

const decodePayload = (jwt: string) => JSON.parse(new TextDecoder().decode(b64urlDecode(jwt.split('.')[1] ?? '')));

// The id_token comes straight from the provider's token endpoint over TLS (OIDC code flow),
// so validating its audience/issuer claims is sufficient here.
async function googleProfile(env: Env, req: Request, code: string): Promise<ProviderProfile> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID!,
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: callbackUrl(req),
      grant_type: 'authorization_code',
    }),
  });
  const data: any = await res.json();
  if (!res.ok || !data.id_token) throw new Error(data.error_description || 'Google token exchange failed');
  const claims = decodePayload(data.id_token);
  if (claims.aud !== env.GOOGLE_CLIENT_ID || !['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss)) {
    throw new Error('Invalid Google token');
  }
  return { sub: claims.sub, email: claims.email, emailVerified: claims.email_verified === true, name: claims.name, avatar: claims.picture };
}

async function appleClientSecret(env: Env) {
  const pem = env.APPLE_PRIVATE_KEY!.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const der = Uint8Array.from(atob(pem), (ch) => ch.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const iat = Math.floor(Date.now() / 1000);
  const enc = new TextEncoder();
  const head = b64url(enc.encode(JSON.stringify({ alg: 'ES256', kid: env.APPLE_KEY_ID })));
  const body = b64url(enc.encode(JSON.stringify({ iss: env.APPLE_TEAM_ID, iat, exp: iat + 300, aud: 'https://appleid.apple.com', sub: env.APPLE_SERVICES_ID })));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(sig)}`;
}

async function appleProfile(env: Env, req: Request, code: string, userJson: string | null): Promise<ProviderProfile> {
  const res = await fetch('https://appleid.apple.com/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.APPLE_SERVICES_ID!,
      client_secret: await appleClientSecret(env),
      redirect_uri: callbackUrl(req),
      grant_type: 'authorization_code',
    }),
  });
  const data: any = await res.json();
  if (!res.ok || !data.id_token) throw new Error(data.error_description || data.error || 'Apple token exchange failed');
  const claims = decodePayload(data.id_token);
  if (claims.aud !== env.APPLE_SERVICES_ID || claims.iss !== 'https://appleid.apple.com') throw new Error('Invalid Apple token');
  // Apple only sends the user's name on the very first authorization.
  let name: string | undefined;
  try {
    const u = userJson ? JSON.parse(userJson) : null;
    name = [u?.name?.firstName, u?.name?.lastName].filter(Boolean).join(' ') || undefined;
  } catch {
    /* name is optional */
  }
  return { sub: claims.sub, email: claims.email, emailVerified: claims.email_verified === true || claims.email_verified === 'true', name };
}
