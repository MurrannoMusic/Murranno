import { hashSecret, verifySecret } from '../lib/crypto';
import { inList, now, type Row } from '../lib/db';
import { fail, requireUser, type FnCtx, type Handler } from './context';
import { artistOfUser, isLabelOf, profileOf } from './shared';

const PIN_MAX_ATTEMPTS = 5;
const PIN_LOCK_MINUTES = 30;

export const ARTIST_COLUMNS = [
  'stage_name', 'bio', 'profile_image', 'spotify_id', 'spotify_url', 'apple_music_id', 'apple_music_url',
  'audiomack_url', 'soundcloud_url', 'deezer_url', 'tidal_url', 'youtube_url', 'instagram_url',
  'facebook_url', 'tiktok_url', 'twitter_url',
];

/** Never hand out the PIN hash itself; callers only test it for truthiness. */
export const maskProfile = (p: Row | null) =>
  p && { ...p, transaction_pin_hash: p.transaction_pin_hash ? true : null, pin_failed_attempts: undefined };

/** Verify a transaction PIN with a persistent lockout (4 digits are otherwise trivially brute-forced). */
export async function checkPin(ctx: FnCtx, userId: string, pin: unknown): Promise<boolean> {
  const p = await profileOf(ctx.db, userId);
  if (!p) throw fail(404, 'User profile not found');
  if (!p.transaction_pin_hash) throw fail(400, 'Transaction PIN not set');
  // Claim an attempt atomically *before* verifying, so parallel guesses can't share the counter.
  // The 5th claimed attempt also sets the lock; while locked no attempt can be claimed at all.
  const lockUntil = new Date(Date.now() + PIN_LOCK_MINUTES * 60_000).toISOString();
  const claim = await ctx.db.first(
    'profiles',
    `UPDATE profiles SET pin_failed_attempts = pin_failed_attempts + 1,
       pin_locked_until = CASE WHEN pin_failed_attempts + 1 >= ? THEN ? ELSE pin_locked_until END
     WHERE id = ? AND (pin_locked_until IS NULL OR pin_locked_until <= ?) AND pin_failed_attempts < ?
     RETURNING pin_failed_attempts`,
    PIN_MAX_ATTEMPTS,
    lockUntil,
    userId,
    new Date().toISOString(),
    PIN_MAX_ATTEMPTS,
  );
  if (!claim) {
    const until = (await profileOf(ctx.db, userId))?.pin_locked_until;
    if (until && Date.parse(until) <= Date.now()) {
      // Lock expired: start a fresh window and retry once.
      await ctx.db.run('UPDATE profiles SET pin_failed_attempts = 0, pin_locked_until = NULL WHERE id = ? AND pin_locked_until = ?', userId, until);
      return checkPin(ctx, userId, pin);
    }
    throw fail(429, `Too many incorrect PIN attempts. Try again after ${until ? new Date(until).toLocaleTimeString() : 'a while'}.`);
  }
  if (!(await verifySecret(String(pin ?? ''), p.transaction_pin_hash))) return false;
  await ctx.db.run('UPDATE profiles SET pin_failed_attempts = 0, pin_locked_until = NULL WHERE id = ?', userId);
  return true;
}

const getProfile: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const profile = await profileOf(ctx.db, userId);
  const tier = await ctx.db.value<string>('SELECT tier FROM user_roles WHERE user_id = ?', userId);
  const subscription = await ctx.db.first(
    'subscriptions',
    "SELECT * FROM subscriptions WHERE user_id = ? ORDER BY (status IN ('active','trial')) DESC, created_at DESC LIMIT 1",
    userId,
  );
  return { success: true, profile: profile ? { ...maskProfile(profile), tier: tier ?? null, subscription } : null };
};

const setupTransactionPin: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const pin = String(ctx.body.pin ?? '');
  if (!/^\d{4}$/.test(pin)) throw fail(400, 'Invalid PIN format. Must be 4 digits.');
  const existing = await profileOf(ctx.db, userId);
  // Changing an existing PIN requires the current one (same lockout as any PIN check).
  if (existing?.transaction_pin_hash) {
    if (!ctx.body.current_pin) throw fail(400, 'Current PIN is required', { code: 'current_pin_required' });
    if (!(await checkPin(ctx, userId, ctx.body.current_pin))) throw fail(400, 'Current PIN is incorrect');
  }
  await ctx.db.update(
    'profiles',
    { transaction_pin_hash: await hashSecret(pin), pin_failed_attempts: 0, pin_locked_until: null },
    'id = ?',
    userId,
  );
  return { success: true };
};

const verifyTransactionPin: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  if (!ctx.body.pin) throw fail(400, 'PIN is required');
  return { success: await checkPin(ctx, userId, ctx.body.pin) };
};

async function artistStats(ctx: FnCtx, artist: Row) {
  const earnings = await ctx.db.all('earnings', 'SELECT amount, status FROM earnings WHERE artist_id = ?', artist.id);
  const releaseCount = (await ctx.db.value<number>('SELECT COUNT(*) FROM releases WHERE artist_id = ?', artist.id)) ?? 0;
  const sum = (s: string) => earnings.filter((e) => e.status === s).reduce((t, e) => t + e.amount, 0);
  const profile = await profileOf(ctx.db, artist.user_id);
  return {
    ...artist,
    kyc_status: profile?.kyc_status ?? 'unverified',
    kyc_tier: profile?.kyc_tier ?? 0,
    releases: [{ count: releaseCount }],
    earnings,
    totalEarnings: sum('paid'),
    pendingEarnings: sum('pending'),
    releaseCount,
  };
}

const getArtistProfile: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const artistId = ctx.param('artistId');
  let artist: Row | null;
  if (artistId) {
    if (!(await isLabelOf(ctx.db, userId, artistId))) {
      const own = await ctx.db.value('SELECT 1 FROM artists WHERE id = ? AND user_id = ?', artistId, userId);
      if (!own) throw fail(403, 'Access denied');
    }
    artist = await ctx.db.first('artists', 'SELECT * FROM artists WHERE id = ?', artistId);
  } else {
    artist = await artistOfUser(ctx.db, userId);
  }
  return { success: true, artist: artist ? await artistStats(ctx, artist) : null };
};

const updateArtistProfile: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const updates: Row = {};
  for (const k of ARTIST_COLUMNS) if (ctx.body[k] !== undefined) updates[k] = ctx.body[k];
  if (updates.stage_name !== undefined && !String(updates.stage_name).trim()) throw fail(400, 'Artist name is required');
  for (const key of ARTIST_COLUMNS.filter(key => key.endsWith('_url'))) if (updates[key] && !/^https?:\/\//i.test(String(updates[key]))) throw fail(400, 'Streaming and social links must start with https:// or http://');
  const personal: Row = {};
  for (const key of ['first_name', 'last_name', 'phone_number', 'nin_number']) if (ctx.body.personal?.[key] !== undefined) personal[key] = String(ctx.body.personal[key]).trim();
  if (personal.nin_number && !/^\d{11}$/.test(personal.nin_number)) throw fail(400, 'NIN must contain 11 digits');
  const profile = await profileOf(ctx.db, userId);
  if (Object.keys(personal).length) personal.full_name = `${personal.first_name ?? profile?.first_name ?? ''} ${personal.last_name ?? profile?.last_name ?? ''}`.trim();
  const artist = await artistOfUser(ctx.db, userId);
  const statements: D1PreparedStatement[] = [];
  if (artist && Object.keys(updates).length) statements.push(await ctx.db.updateStmt('artists', updates, 'id = ?', artist.id));
  if (!artist) statements.push(await ctx.db.insertStmt('artists', { ...updates, stage_name: updates.stage_name || profile?.full_name || 'Artist', user_id: userId }));
  if (Object.keys(personal).length) statements.push(await ctx.db.updateStmt('profiles', personal, 'id = ?', userId));
  if (statements.length) await ctx.db.batch(statements);
  const result = await artistOfUser(ctx.db, userId);
  return { success: true, artist: result ? await artistStats(ctx, result) : null };
};

const getArtistDetail: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const artistId = ctx.param('artistId');
  if (!artistId) throw fail(400, 'Artist ID is required');
  const artist = await ctx.db.first('artists', 'SELECT * FROM artists WHERE id = ?', artistId);
  if (!artist) throw fail(404, 'Artist not found');
  const labelRelation = await ctx.db.first(
    'label_artists',
    "SELECT * FROM label_artists WHERE artist_id = ? AND label_id = ? AND status = 'active'",
    artistId,
    userId,
  );
  if (artist.user_id !== userId && !labelRelation) throw fail(403, 'Access denied');

  const releases = await ctx.db.all('releases', 'SELECT * FROM releases WHERE artist_id = ? ORDER BY release_date DESC', artistId);
  const ids = inList(releases.map((r) => r.id));
  const streams = await ctx.db.d1
    .prepare(
      `SELECT t.release_id, COALESCE(SUM(s.streams), 0) AS streams FROM tracks t
       JOIN streaming_data s ON s.track_id = t.id WHERE t.release_id IN ${ids.sql} GROUP BY t.release_id`,
    )
    .bind(...ids.params)
    .all<{ release_id: string; streams: number }>();
  const paid = await ctx.db.all('earnings', "SELECT release_id, amount FROM earnings WHERE artist_id = ? AND status = 'paid'", artistId);

  const releasesWithStats = releases.map((r) => ({
    ...r,
    streams: streams.results.find((s) => s.release_id === r.id)?.streams ?? 0,
    earnings: paid.filter((e) => e.release_id === r.id).reduce((t, e) => t + e.amount, 0),
  }));
  return {
    success: true,
    artist: {
      ...artist,
      totalStreams: releasesWithStats.reduce((t, r) => t + r.streams, 0),
      totalEarnings: paid.reduce((t, e) => t + e.amount, 0),
      releaseCount: releases.length,
    },
    releases: releasesWithStats,
    labelRelation,
    payoutHistory: [],
  };
};

const deleteAccount: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  // Deleting would cascade the wallet away: money owed to the user (or in flight) must be settled first.
  const wallet = await ctx.db.first('wallet_balance', 'SELECT available_balance, pending_balance FROM wallet_balance WHERE user_id = ?', userId);
  if (wallet && (wallet.available_balance > 0 || wallet.pending_balance > 0)) {
    throw fail(400, 'Please withdraw your wallet balance (and wait for pending withdrawals) before deleting your account.');
  }
  // FK cascades remove profile, roles, wallet, sessions, notifications, campaigns…;
  // the withdrawal ledger is kept (user_id set to NULL) for financial records.
  await ctx.db.run('DELETE FROM auth_users WHERE id = ?', userId);
  return { success: true, message: 'Account deleted successfully' };
};

const registerPushToken: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const { token, platform, deviceInfo } = ctx.body;
  if (!token || !platform) throw fail(400, 'token and platform are required');
  await ctx.db.batch([
    ctx.db.stmt('UPDATE push_notification_tokens SET is_active = 0 WHERE token = ? AND user_id != ?', token, userId),
    await ctx.db.upsertStmt('push_notification_tokens', {
      user_id: userId, token, platform,
      device_info: { ...(deviceInfo && typeof deviceInfo === 'object' ? deviceInfo : {}), session_id: ctx.auth!.sessionId },
      is_active: true, updated_at: now(),
    }, ['user_id', 'token']),
  ]);
  return { success: true, message: 'Token registered successfully' };
};

export const profileFunctions: Record<string, Handler> = {
  'get-profile': getProfile,
  'setup-transaction-pin': setupTransactionPin,
  'verify-transaction-pin': verifyTransactionPin,
  'get-artist-profile': getArtistProfile,
  'update-artist-profile': updateArtistProfile,
  'get-artist-detail': getArtistDetail,
  'delete-account': deleteAccount,
  'register-push-token': registerPushToken,
  // Welcome emails are now sent by the server when the email is confirmed.
  'send-welcome-email': async () => ({ success: true, message: 'Welcome email is sent on email confirmation' }),
};
