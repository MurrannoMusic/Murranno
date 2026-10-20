import { randomDigits, randomToken, sha256Hex, timingSafeEqual } from '../lib/crypto';
import { DB, now } from '../lib/db';
import { authError } from './session';

export type TokenType = 'signup' | 'recovery' | 'email_change';

const TTL_MS: Record<TokenType, number> = { signup: 24 * 3600_000, recovery: 3600_000, email_change: 24 * 3600_000 };
const MAX_ATTEMPTS = 5;

/** Issue a fresh code + link token, replacing any earlier one of the same type. */
export async function issueToken(db: DB, userId: string, type: TokenType, newEmail: string | null = null) {
  const code = randomDigits(6);
  const link = randomToken();
  await db.batch([
    db.stmt('DELETE FROM auth_tokens WHERE user_id = ? AND type = ?', userId, type),
    await db.insertStmt('auth_tokens', {
      user_id: userId,
      type,
      token_hash: await sha256Hex(link),
      code_hash: await sha256Hex(`${userId}:${code}`),
      new_email: newEmail,
      expires_at: new Date(Date.now() + TTL_MS[type]).toISOString(),
    }),
  ]);
  return { code, link };
}

export function verifyLink(req: Request, link: string, type: TokenType, redirectTo: string) {
  const u = new URL('/auth/v1/verify', req.url);
  u.searchParams.set('token', link);
  u.searchParams.set('type', type);
  u.searchParams.set('redirect_to', redirectTo);
  return u.toString();
}

const expired = () => authError(403, 'otp_expired', 'Token has expired or is invalid');

type TokenRow = { id: string; user_id: string; type: TokenType; new_email: string | null; code_hash: string };

/**
 * Check a 6-digit code for a user. An attempt is consumed atomically *before* comparing, so parallel
 * guesses can't share one counter value; after MAX_ATTEMPTS the code is dead. Success deletes the row
 * and only the request that actually deleted it wins (single use).
 */
export async function consumeCode(db: DB, userId: string, types: TokenType[], code: string) {
  const row = await db.first<TokenRow>(
    'auth_tokens',
    `UPDATE auth_tokens SET attempts = attempts + 1
     WHERE id = (SELECT id FROM auth_tokens WHERE user_id = ? AND type IN (SELECT value FROM json_each(?)) AND expires_at > ?
                 ORDER BY created_at DESC LIMIT 1)
       AND attempts < ?
     RETURNING *`,
    userId,
    JSON.stringify(types),
    now(),
    MAX_ATTEMPTS,
  );
  if (!row) throw expired();
  if (!timingSafeEqual(await sha256Hex(`${userId}:${String(code).trim()}`), row.code_hash)) throw expired();
  const won = await db.first<TokenRow>('auth_tokens', 'DELETE FROM auth_tokens WHERE id = ? RETURNING *', row.id);
  if (!won) throw expired();
  return won;
}

export async function consumeLink(db: DB, link: string) {
  const row = await db.first<TokenRow>(
    'auth_tokens',
    'DELETE FROM auth_tokens WHERE token_hash = ? AND expires_at > ? RETURNING *',
    await sha256Hex(link),
    now(),
  );
  if (!row) throw expired();
  return row;
}
