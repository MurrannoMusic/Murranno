import { inList, type Row } from '../lib/db';
import { signJwt, verifyJwt } from '../lib/crypto';
import { sendEmailSafe, templates } from '../lib/email';
import { fail, requireUser, type FnCtx, type Handler } from './context';
import { decorateSubscription, notify, profileOf } from './shared';

/** Label/agency access = that role, or an active (or trialing) subscription for that tier. */
async function hasTier(ctx: FnCtx, userId: string, tier: 'label' | 'agency') {
  const role = await ctx.db.value<string>('SELECT tier FROM user_roles WHERE user_id = ?', userId);
  if (role === tier || role === 'admin') return true;
  const sub = await ctx.db.first('subscriptions', 'SELECT * FROM subscriptions WHERE user_id = ? AND tier = ?', userId, tier);
  return Boolean(sub && decorateSubscription(sub).isActive);
}

const INVITE_TTL_SECONDS = 7 * 86400;
const inviteKey = (ctx: FnCtx) => `${ctx.env.JWT_SECRET}:invite`;

/** Signed one-relationship accept link, delivered only to the invited artist's inbox. */
async function inviteLink(ctx: FnCtx, kind: 'label' | 'agency', id: string) {
  const token = await signJwt({ kind, id, exp: Math.floor(Date.now() / 1000) + INVITE_TTL_SECONDS }, inviteKey(ctx));
  const url = new URL('/functions/v1/accept-invite', ctx.req.url);
  url.searchParams.set('token', token);
  return url.toString();
}

/** Invitations are transactional: sent even when marketing/notification emails are off. */
async function sendInvite(ctx: FnCtx, userId: string, subject: string, html: string) {
  const p = await profileOf(ctx.db, userId);
  if (p?.email) await sendEmailSafe(ctx.env, p.email, subject, html);
}

const acceptInvite: Handler = async (ctx) => {
  const claims = await verifyJwt<{ kind: 'label' | 'agency'; id: string }>(String(ctx.param('token') ?? ''), inviteKey(ctx));
  const table = claims?.kind === 'label' ? 'label_artists' : claims?.kind === 'agency' ? 'agency_clients' : null;
  const accepted = table ? await ctx.db.update(table, { status: 'active' }, "id = ? AND status = 'pending'", claims!.id) : [];
  const target = new URL('/app/dashboard', ctx.env.APP_URL);
  target.searchParams.set('invite', accepted.length ? 'accepted' : 'invalid');
  return Response.redirect(target.toString(), 303);
};

/** Release count, total streams and paid earnings per artist, in three grouped queries. */
async function artistStats(ctx: FnCtx, artistIds: string[]) {
  const ids = inList(artistIds);
  const releases = await ctx.db.d1
    .prepare(`SELECT artist_id, COUNT(*) AS n FROM releases WHERE artist_id IN ${ids.sql} GROUP BY artist_id`)
    .bind(...ids.params)
    .all<{ artist_id: string; n: number }>();
  const streams = await ctx.db.d1
    .prepare(
      `SELECT r.artist_id, COALESCE(SUM(s.streams), 0) AS n FROM releases r JOIN tracks t ON t.release_id = r.id
       JOIN streaming_data s ON s.track_id = t.id WHERE r.artist_id IN ${ids.sql} GROUP BY r.artist_id`,
    )
    .bind(...ids.params)
    .all<{ artist_id: string; n: number }>();
  const earnings = await ctx.db.d1
    .prepare(`SELECT artist_id, status, COALESCE(SUM(amount), 0) AS n FROM earnings WHERE artist_id IN ${ids.sql} GROUP BY artist_id, status`)
    .bind(...ids.params)
    .all<{ artist_id: string; status: string; n: number }>();
  const campaigns = await ctx.db.d1
    .prepare(`SELECT artist_id, COUNT(*) AS n FROM campaigns WHERE artist_id IN ${ids.sql} GROUP BY artist_id`)
    .bind(...ids.params)
    .all<{ artist_id: string; n: number }>();
  const of = (rows: { artist_id: string; n: number }[], id: string) => rows.find((r) => r.artist_id === id)?.n ?? 0;
  return (id: string) => ({
    releases: of(releases.results, id),
    streams: of(streams.results, id),
    campaigns: of(campaigns.results, id),
    allEarnings: earnings.results.filter((e) => e.artist_id === id).reduce((t, e) => t + e.n, 0) / 100,
    paidEarnings: earnings.results.filter((e) => e.artist_id === id && e.status === 'paid').reduce((t, e) => t + e.n, 0) / 100,
  });
}

const getLabelArtists: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const status = ctx.param('status') || 'active';
  const rows = await ctx.db.all(
    'label_artists',
    `SELECT la.*, a.stage_name AS _stage_name, a.profile_image AS _profile_image FROM label_artists la
     JOIN artists a ON a.id = la.artist_id WHERE la.label_id = ? ${status !== 'all' ? 'AND la.status = ?' : ''}
     ORDER BY la.created_at DESC`,
    ...[userId, ...(status !== 'all' ? [status] : [])],
  );
  // Stats only for accepted relationships: a pending invite must not reveal the artist's numbers.
  const stats = await artistStats(ctx, rows.filter((r) => r.status === 'active').map((r) => r.artist_id));
  return {
    artists: rows.map((la) => {
      const s = stats(la.artist_id);
      return {
        id: la.artist_id,
        name: la._stage_name,
        stageName: la._stage_name,
        profileImage: la._profile_image,
        status: la.status,
        revenueShare: la.revenue_share_percentage,
        contractStartDate: la.contract_start_date,
        contractEndDate: la.contract_end_date,
        stats: la.status === 'active' ? { releases: s.releases, streams: s.streams, earnings: Math.round(s.allEarnings * 100) / 100 } : null,
      };
    }),
  };
};

async function assertRosterRoom(ctx: FnCtx, userId: string) {
  const max = await ctx.db.value<number>("SELECT max_artists FROM subscription_plans WHERE tier = 'label'");
  const current = (await ctx.db.value<number>("SELECT COUNT(*) FROM label_artists WHERE label_id = ? AND status = 'active'", userId)) ?? 0;
  if (max && current >= max) {
    throw fail(403, 'Artist limit reached', { message: `Your label plan allows up to ${max} artists. Please upgrade to add more.`, limit: max, current });
  }
}

const addArtistToLabel: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  if (!(await hasTier(ctx, userId, 'label'))) throw fail(403, 'Only labels can add artists');
  const { stageName, revenueSharePercentage, contractStartDate, contractEndDate } = ctx.body;
  if (!stageName) throw fail(400, 'Stage name is required');
  await assertRosterRoom(ctx, userId);
  const artist = await ctx.db.insert('artists', { stage_name: stageName });
  const labelArtist = await ctx.db.insert('label_artists', {
    label_id: userId,
    artist_id: artist.id,
    status: 'active',
    revenue_share_percentage: revenueSharePercentage ?? null,
    contract_start_date: contractStartDate ?? null,
    contract_end_date: contractEndDate ?? null,
  });
  return { success: true, artist: { id: artist.id, stageName: artist.stage_name, ...labelArtist } };
};

const inviteArtistToLabel: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  if (!(await hasTier(ctx, userId, 'label'))) throw fail(403, 'Only labels can invite artists');
  const { artistEmail, revenueSharePercentage, contractStartDate, contractEndDate } = ctx.body;
  if (!artistEmail) throw fail(400, 'Artist email is required');
  const target = await ctx.db.first('profiles', 'SELECT id FROM profiles WHERE email = ? COLLATE NOCASE', String(artistEmail).trim());
  if (!target) throw fail(404, 'Artist with this email not found');
  if ((await ctx.db.value<string>('SELECT tier FROM user_roles WHERE user_id = ?', target.id)) !== 'artist') throw fail(400, 'User is not an artist');
  const artist = await ctx.db.first('artists', 'SELECT id, stage_name FROM artists WHERE user_id = ?', target.id);
  if (!artist) throw fail(404, 'Artist profile not found');
  await assertRosterRoom(ctx, userId);

  const share = revenueSharePercentage ?? 50;
  let labelArtist: Row;
  try {
    // Pending until the artist accepts: a label must not gain access to someone's catalogue unilaterally.
    labelArtist = await ctx.db.insert('label_artists', {
      label_id: userId,
      artist_id: artist.id,
      revenue_share_percentage: share,
      contract_start_date: contractStartDate ?? null,
      contract_end_date: contractEndDate ?? null,
      status: 'pending',
    });
  } catch (e: any) {
    if (/UNIQUE/i.test(String(e?.message))) throw fail(409, 'Artist is already signed to or invited by this label');
    throw e;
  }
  const label = await profileOf(ctx.db, userId);
  const labelName = label?.full_name || 'A record label';
  await notify(ctx.db, target.id, { title: 'Label Invitation', message: `${labelName} invited you to their roster. Check your email to accept.`, related_type: 'label', related_id: userId }, ctx.env);
  const acceptUrl = await inviteLink(ctx, 'label', labelArtist.id);
  ctx.waitUntil(
    sendInvite(ctx, target.id, `${labelName} invited you to their roster`, templates.labelInvitation(acceptUrl, artist.stage_name || 'Artist', labelName, share, contractStartDate, contractEndDate)),
  );
  return { success: true, labelArtist };
};

const getAgencyClients: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const status = ctx.param('status');
  const rows = await ctx.db.all(
    'agency_clients',
    `SELECT ac.*, a.id AS _artist_id, a.stage_name AS _stage_name, a.profile_image AS _profile_image
     FROM agency_clients ac LEFT JOIN artists a ON a.user_id = ac.client_id
     WHERE ac.agency_id = ? ${status ? 'AND ac.status = ?' : ''}`,
    ...[userId, ...(status ? [status] : [])],
  );
  // Stats only for accepted relationships (see getLabelArtists).
  const stats = await artistStats(ctx, rows.filter((r) => r.status === 'active' && r._artist_id).map((r) => r._artist_id));
  return {
    success: true,
    clients: rows.map((c) => {
      const s = stats(c._artist_id);
      return {
        id: c.id,
        client_id: c.client_id,
        stage_name: c._stage_name || 'Unknown Artist',
        profile_image: c._profile_image,
        status: c.status,
        commission_percentage: c.commission_percentage,
        contract_details: c.contract_details,
        notes: c.notes,
        created_at: c.created_at,
        ...(c.status === 'active'
          ? { releases: s.releases, streams: String(s.streams), campaigns: s.campaigns, revenue: s.paidEarnings.toFixed(2) }
          : { releases: null, streams: null, campaigns: null, revenue: null }),
      };
    }),
  };
};

const addClientToAgency: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  if (!(await hasTier(ctx, userId, 'agency'))) throw fail(403, 'Only agencies can add clients');
  const { clientId, commissionPercentage, contractDetails, notes } = ctx.body;
  if (!clientId) throw fail(400, 'Client ID is required');
  if ((await ctx.db.value<string>('SELECT tier FROM user_roles WHERE user_id = ?', clientId)) !== 'artist') throw fail(400, 'Client must be an artist');
  let agencyClient: Row;
  try {
    // Pending until the artist accepts (same reasoning as label invites).
    agencyClient = await ctx.db.insert('agency_clients', {
      agency_id: userId,
      client_id: clientId,
      commission_percentage: commissionPercentage ?? 15,
      contract_details: contractDetails ?? {},
      notes: notes ?? null,
      status: 'pending',
    });
  } catch (e: any) {
    if (/UNIQUE/i.test(String(e?.message))) throw fail(409, 'Client is already signed to or invited by this agency');
    throw e;
  }
  const agency = await profileOf(ctx.db, userId);
  const agencyName = agency?.full_name || 'An agency';
  await notify(ctx.db, clientId, { title: 'Agency Invitation', message: `${agencyName} invited you to become a client. Check your email to accept.`, related_type: 'agency', related_id: userId }, ctx.env);
  const artist = await ctx.db.first('artists', 'SELECT stage_name FROM artists WHERE user_id = ?', clientId);
  const acceptUrl = await inviteLink(ctx, 'agency', agencyClient.id);
  ctx.waitUntil(
    sendInvite(ctx, clientId, `${agencyName} invited you to become a client`, templates.agencyInvitation(acceptUrl, artist?.stage_name || 'Artist', agencyName, commissionPercentage ?? 15)),
  );
  return { success: true, agencyClient };
};

const getAgencyCampaignAnalytics: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const clientId = ctx.param('clientId');
  const clients = await ctx.db.all(
    'agency_clients',
    `SELECT ac.client_id, a.id AS artist_id, a.stage_name FROM agency_clients ac
     LEFT JOIN artists a ON a.user_id = ac.client_id WHERE ac.agency_id = ? AND ac.status = 'active'`,
    userId,
  );
  const empty = { totalCampaigns: 0, activeCampaigns: 0, totalSpent: '0', totalReach: '0', totalImpressions: '0', totalEngagement: '0', avgROI: '0' };
  const artistIds = clients
    .filter((c) => c.artist_id && (!clientId || c.client_id === clientId))
    .map((c) => c.artist_id);
  if (clients.length === 0) return { success: true, analytics: empty, campaignsByClient: [] };

  const ids = inList(artistIds);
  const campaigns = await ctx.db.all('campaigns', `SELECT * FROM campaigns WHERE artist_id IN ${ids.sql}`, ...ids.params);
  const cids = inList(campaigns.map((c) => c.id));
  const totals = await ctx.db.d1
    .prepare(
      `SELECT COALESCE(SUM(reach),0) AS reach, COALESCE(SUM(impressions),0) AS impressions,
              COALESCE(SUM(engagement),0) AS engagement, COALESCE(SUM(clicks),0) AS clicks
       FROM campaign_metrics WHERE campaign_id IN ${cids.sql}`,
    )
    .bind(...cids.params)
    .first<{ reach: number; impressions: number; engagement: number; clicks: number }>();
  const sum = (rows: Row[], k: string) => rows.reduce((t, c) => t + Number(c[k] || 0), 0);
  const totalSpent = sum(campaigns, 'spent');
  return {
    success: true,
    analytics: {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === 'Active').length,
      totalSpent: totalSpent.toFixed(2),
      totalBudget: sum(campaigns, 'budget').toFixed(2),
      totalReach: String(totals?.reach ?? 0),
      totalImpressions: String(totals?.impressions ?? 0),
      totalEngagement: String(totals?.engagement ?? 0),
      totalClicks: String(totals?.clicks ?? 0),
      avgROI: totalSpent > 0 ? (((totals?.reach ?? 0) / totalSpent) * 100).toFixed(2) : '0',
    },
    campaignsByClient: clients.map((client) => {
      const own = campaigns.filter((c) => c.artist_id && c.artist_id === client.artist_id);
      return {
        client_id: client.client_id,
        artist_name: client.stage_name || 'Unknown',
        campaigns: own.length,
        spent: sum(own, 'spent').toFixed(2),
        budget: sum(own, 'budget').toFixed(2),
        active: own.filter((c) => c.status === 'Active').length,
      };
    }),
  };
};

export const rosterFunctions: Record<string, Handler> = {
  'get-label-artists': getLabelArtists,
  'add-artist-to-label': addArtistToLabel,
  'invite-artist-to-label': inviteArtistToLabel,
  'get-agency-clients': getAgencyClients,
  'add-client-to-agency': addClientToAgency,
  'get-agency-campaign-analytics': getAgencyCampaignAnalytics,
  'accept-invite': acceptInvite,
};
