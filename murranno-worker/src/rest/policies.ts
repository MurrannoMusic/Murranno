import type { AuthContext } from '../env';
import type { DB, Row } from '../lib/db';
import { HttpError } from '../lib/http';

/**
 * Row-level access rules for /rest/v1 (replaces Supabase RLS). Tables not listed here are not
 * reachable over REST at all (auth_*, payments, idempotency keys, OTPs, push tokens).
 * Money, ledger and role tables are read-only here: they change only through /functions.
 */
export interface Pred {
  sql: string;
  params: unknown[];
}
/** Builds a WHERE fragment for a table alias. */
export type Scope = (a: string) => Pred;

export interface PolicyCtx {
  auth: AuthContext | null;
  ip: string;
  db: DB;
}

interface WriteRule {
  /** Only these columns may be written by non-admins. */
  columns?: string[];
  /** Server-controlled values that override whatever the client sent. */
  force?: (ctx: PolicyCtx) => Row;
  check?: (ctx: PolicyCtx, row: Row) => Promise<void> | void;
}

export interface TablePolicy {
  anonRead?: boolean;
  anonInsert?: boolean;
  select?: (uid: string) => Scope;
  insert?: WriteRule;
  update?: WriteRule & { where: (uid: string) => Scope };
  delete?: (uid: string) => Scope;
  /** Admins may insert/update/delete any row (admins can always read). */
  adminWrite?: boolean;
  /** Secret columns: returned as `true` when set, never their value. */
  mask?: string[];
}

const col = (a: string, c: string) => `${a}."${c}"`;
const own = (c = 'user_id') => (uid: string) => (a: string) => ({ sql: `${col(a, c)} = ?`, params: [uid] });
const ownArtist = (c: string) => (uid: string) => (a: string) => ({
  sql: `${col(a, c)} IN (SELECT id FROM artists WHERE user_id = ?)`,
  params: [uid],
});
const ownRelease = (c: string) => (uid: string) => (a: string) => ({
  sql: `${col(a, c)} IN (SELECT r.id FROM releases r JOIN artists ar ON ar.id = r.artist_id WHERE ar.user_id = ?)`,
  params: [uid],
});
const ownTrack = (c: string) => (uid: string) => (a: string) => ({
  sql: `${col(a, c)} IN (SELECT t.id FROM tracks t JOIN releases r ON r.id = t.release_id JOIN artists ar ON ar.id = r.artist_id WHERE ar.user_id = ?)`,
  params: [uid],
});
const ownCampaign = (c: string) => (uid: string) => (a: string) => ({
  sql: `${col(a, c)} IN (SELECT id FROM campaigns WHERE user_id = ?)`,
  params: [uid],
});
const forceUser = (ctx: PolicyCtx) => ({ user_id: ctx.auth!.userId });
const deny = (msg: string) => new HttpError(403, msg, { code: '42501' });

const PROFILE_SELF_COLUMNS = [
  'full_name',
  'first_name',
  'last_name',
  'phone_number',
  'avatar_url',
  'nin_number',
  'id_document_url',
  'id_document_type',
  'kyc_status',
  'kyc_tier',
];

const ARTIST_COLUMNS = [
  'stage_name', 'bio', 'profile_image', 'spotify_id', 'spotify_url', 'apple_music_id', 'apple_music_url',
  'audiomack_url', 'soundcloud_url', 'deezer_url', 'tidal_url', 'youtube_url', 'instagram_url',
  'facebook_url', 'tiktok_url', 'twitter_url',
];

const NOTIFICATION_PREF_COLUMNS = [
  'email_notifications', 'push_notifications', 'in_app_notifications', 'release_updates',
  'campaign_updates', 'earnings_alerts', 'marketing_emails',
];

export const policies: Record<string, TablePolicy> = {
  profiles: {
    select: own('id'),
    mask: ['transaction_pin_hash'],
    update: {
      where: own('id'),
      columns: PROFILE_SELF_COLUMNS,
      check: (_ctx, row) => {
        // Users may submit KYC for review, never approve it themselves.
        if (row.kyc_status !== undefined && row.kyc_status !== 'pending') throw deny('kyc_status can only be set to pending');
        if (row.kyc_tier !== undefined && Number(row.kyc_tier) !== 1) throw deny('kyc_tier is set by an administrator');
      },
    },
    adminWrite: true,
  },
  user_roles: { select: own() },
  subscriptions: { select: own() },
  subscription_plans: { anonRead: true },
  notification_preferences: {
    select: own(),
    insert: { columns: NOTIFICATION_PREF_COLUMNS, force: forceUser },
    update: { where: own(), columns: NOTIFICATION_PREF_COLUMNS },
  },
  notifications: {
    select: own(),
    update: { where: own(), columns: ['is_read', 'read_at'] },
    delete: own(),
  },
  security_logs: {
    select: own(),
    insert: {
      columns: ['event', 'details', 'user_agent'],
      force: (ctx) => ({ user_id: ctx.auth!.userId, ip_address: ctx.ip }),
    },
  },
  artists: {
    // Own artist profile, plus artists on the caller's label roster.
    select: (uid) => (a) => ({
      sql: `(${col(a, 'user_id')} = ? OR ${col(a, 'id')} IN (SELECT artist_id FROM label_artists WHERE label_id = ? AND status = 'active'))`,
      params: [uid, uid],
    }),
    insert: {
      columns: ARTIST_COLUMNS,
      force: forceUser,
      check: async (ctx) => {
        const existing = await ctx.db.value('SELECT id FROM artists WHERE user_id = ?', ctx.auth!.userId);
        if (existing) throw new HttpError(409, 'Artist profile already exists', { code: '23505' });
      },
    },
    update: { where: own(), columns: ARTIST_COLUMNS },
    adminWrite: true,
  },
  releases: { select: ownArtist('artist_id'), adminWrite: true },
  tracks: { select: ownRelease('release_id'), adminWrite: true },
  streaming_data: { select: ownTrack('track_id') },
  earnings: { select: ownArtist('artist_id') },
  label_artists: { select: own('label_id') },
  agency_clients: { select: own('agency_id') },
  wallet_balance: { select: own() },
  payout_methods: { select: own() },
  withdrawal_transactions: { select: own() },
  promotion_services: { anonRead: true, adminWrite: true },
  promotion_bundles: { anonRead: true, adminWrite: true },
  bundle_services: { anonRead: true, adminWrite: true },
  cart_items: {
    select: own(),
    insert: { columns: ['service_id', 'bundle_id', 'quantity'], force: forceUser },
    update: { where: own(), columns: ['quantity'] },
    delete: own(),
  },
  campaigns: { select: own(), adminWrite: true },
  campaign_services: {
    select: ownCampaign('campaign_id'),
    insert: {
      columns: ['campaign_id', 'service_id'],
      force: () => ({ status: 'pending' }),
      check: async (ctx, row) => {
        const c = await ctx.db.first('campaigns', 'SELECT user_id, payment_status, payment_reference FROM campaigns WHERE id = ?', row.campaign_id);
        if (!c || c.user_id !== ctx.auth!.userId) throw deny('new row violates row-level security policy for table "campaign_services"');
        if (c.payment_status === 'paid' || c.payment_reference) throw deny('Services cannot be changed once checkout has started');
      },
    },
    adminWrite: true,
  },
  campaign_metrics: { select: ownCampaign('campaign_id'), adminWrite: true },
  support_tickets: {
    select: own(),
    anonInsert: true,
    insert: {
      columns: ['subject', 'message', 'category', 'name', 'email'],
      force: (ctx) => ({ user_id: ctx.auth?.userId ?? null, status: 'open' }),
    },
    adminWrite: true,
  },
  system_announcements: { anonRead: true, adminWrite: true },
  audit_logs: { adminWrite: true },
  admin_audit_logs: {},
  platform_settings: {},
};
