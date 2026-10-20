import { inList, kobo, now, type Row } from '../lib/db';
import { templates } from '../lib/email';
import { paystack, paystackReference } from '../lib/paystack';
import { campaignTotal } from '../payments';
import { fail, requireAdmin, requireUser, type FnCtx, type Handler } from './context';
import { audit, emailUser, isLabelOf, profileOf } from './shared';

/** States a user may create a campaign in; anything past payment is set by the server/admins. */
const USER_STATUSES = ['Draft', 'Pending', 'Pending Payment'];

async function campaignsWithRefs(ctx: FnCtx, where: string, ...params: unknown[]) {
  const rows = await ctx.db.all(
    'campaigns',
    `SELECT c.*, a.stage_name AS _artist_stage_name, r.title AS _release_title,
            (SELECT COALESCE(SUM(m.reach), 0) FROM campaign_metrics m WHERE m.campaign_id = c.id) AS reach,
            (SELECT COALESCE(AVG(m.engagement), 0) FROM campaign_metrics m WHERE m.campaign_id = c.id) AS engagement
     FROM campaigns c LEFT JOIN artists a ON a.id = c.artist_id LEFT JOIN releases r ON r.id = c.release_id WHERE ${where}`,
    ...params,
  );
  return rows.map(({ _artist_stage_name, _release_title, ...c }) => ({
    ...c,
    artists: c.artist_id ? { stage_name: _artist_stage_name } : null,
    releases: c.release_id ? { title: _release_title } : null,
  }));
}

/** May this user run campaigns for that artist? (own artist, signed label artist, or agency client) */
async function canPromote(ctx: FnCtx, userId: string, artistId: string) {
  const own = await ctx.db.value('SELECT 1 FROM artists WHERE id = ? AND user_id = ?', artistId, userId);
  if (own || (await isLabelOf(ctx.db, userId, artistId))) return true;
  return Boolean(
    await ctx.db.value(
      `SELECT 1 FROM agency_clients ac JOIN artists a ON a.user_id = ac.client_id
       WHERE ac.agency_id = ? AND a.id = ? AND ac.status = 'active'`,
      userId,
      artistId,
    ),
  );
}

const getUserCampaigns: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const status = ctx.param('status');
  const campaigns = await campaignsWithRefs(
    ctx,
    `c.user_id = ? ${status && status !== 'all' ? 'AND c.status = ?' : ''} ORDER BY c.created_at DESC`,
    ...[userId, ...(status && status !== 'all' ? [status] : [])],
  );
  return {
    success: true,
    campaigns,
    stats: {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === 'Active').length,
      totalSpent: campaigns.reduce((t, c) => t + Number(c.spent || 0), 0),
      totalReach: campaigns.reduce((t, c) => t + Number(c.reach || 0), 0).toLocaleString(),
      totalBudget: campaigns.reduce((t, c) => t + Number(c.budget || 0), 0),
    },
  };
};

const createCampaign: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const b = ctx.body;
  if (!b.name || !b.type || !b.platform || !b.start_date) throw fail(400, 'name, type, platform and start_date are required');
  const budget = Number(b.budget ?? 0);
  if (!Number.isFinite(budget) || budget < 0) throw fail(400, 'Invalid budget');

  let artistId = b.artist_id ?? null;
  if (b.release_id) {
    const release = await ctx.db.first('releases', 'SELECT artist_id FROM releases WHERE id = ?', b.release_id);
    if (!release) throw fail(404, 'Release not found');
    artistId ??= release.artist_id;
    if (release.artist_id !== artistId) throw fail(400, 'Release does not belong to that artist');
  }
  if (artistId && !(await canPromote(ctx, userId, artistId))) throw fail(403, 'You cannot create campaigns for this artist');

  const campaign = await ctx.db.insert('campaigns', {
    user_id: userId,
    name: b.name,
    type: b.type,
    platform: b.platform,
    budget,
    start_date: b.start_date,
    end_date: b.end_date ?? null,
    artist_id: artistId,
    release_id: b.release_id ?? null,
    status: USER_STATUSES.includes(b.status) ? b.status : 'Draft',
    promotion_type: b.promotion_type || 'bundle',
    bundle_id: b.bundle_id ?? null,
    category: b.category ?? null,
    campaign_assets: b.campaign_assets ?? null,
    campaign_brief: b.campaign_brief ?? null,
    target_audience: b.target_audience ?? null,
    social_links: b.social_links ?? null,
    spent: 0,
  });
  return { success: true, campaign };
};

const pauseCampaign: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const { campaignId, pause } = ctx.body;
  if (!campaignId || typeof pause !== 'boolean') throw fail(400, 'campaignId and pause flag are required');
  const campaign = await ctx.db.first('campaigns', 'SELECT status, user_id FROM campaigns WHERE id = ?', campaignId);
  if (!campaign) throw fail(404, 'Campaign not found');
  if (campaign.user_id !== userId) throw fail(403, 'Forbidden - Not campaign owner');
  const [from, to] = pause ? ['Active', 'Paused'] : ['Paused', 'Active'];
  if (campaign.status !== from) throw fail(400, pause ? 'Only active campaigns can be paused' : 'Only paused campaigns can be resumed');
  const [updated] = await ctx.db.update('campaigns', { status: to }, 'id = ? AND status = ?', campaignId, from);
  return { success: true, campaign: updated };
};

const getCampaignPerformance: Handler = async (ctx) => {
  const { userId, isAdmin } = requireUser(ctx);
  const campaignId = ctx.param('campaignId');
  if (!campaignId) throw fail(400, 'Campaign ID is required');
  const owner = await ctx.db.value<string>('SELECT user_id FROM campaigns WHERE id = ?', campaignId);
  if (!owner) throw fail(404, 'Campaign not found');
  if (!isAdmin && owner !== userId) throw fail(403, 'Forbidden');
  const metrics = await ctx.db.all('campaign_metrics', 'SELECT * FROM campaign_metrics WHERE campaign_id = ? ORDER BY date ASC', campaignId);
  return {
    success: true,
    data: metrics.map((m) => ({
      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      reach: Number(m.reach),
      engagement: Number(m.engagement),
      clicks: Number(m.clicks),
      conversions: Number(m.conversions),
    })),
  };
};

const initializeCampaignPayment: Handler = async (ctx) => {
  const { userId, email } = requireUser(ctx);
  const campaignId = ctx.body.campaign_id;
  if (!campaignId) throw fail(400, 'Campaign ID is required');
  const campaign = await ctx.db.first('campaigns', 'SELECT * FROM campaigns WHERE id = ? AND user_id = ?', campaignId, userId);
  if (!campaign) throw fail(404, 'Campaign not found or unauthorized');
  if (campaign.payment_status === 'paid') throw fail(400, 'Campaign is already paid');

  // The price always comes from the catalogue, never from the client.
  const total = await campaignTotal(ctx.db, campaign);
  if (total <= 0) throw fail(400, 'Campaign has no services or bundle selected');

  const profile = await profileOf(ctx.db, userId);
  const res = await paystack(ctx.env, '/transaction/initialize', {
    body: {
      email: profile?.email || email,
      amount: kobo(total),
      currency: 'NGN',
      reference: paystackReference('CMP'),
      metadata: { user_id: userId, campaign_id: campaignId, campaign_name: campaign.name, full_name: profile?.full_name || '', payment_type: 'campaign' },
      callback_url: new URL('/app/campaign-payment-success', ctx.env.APP_URL).toString(),
    },
  });
  if (!res.status) throw fail(400, res.message || 'Payment initialization failed');
  await ctx.db.update(
    'campaigns',
    { status: 'Pending Payment', payment_status: 'pending', payment_reference: res.data.reference, payment_amount: total },
    'id = ?',
    campaignId,
  );
  return { authorization_url: res.data.authorization_url, access_code: res.data.access_code, reference: res.data.reference };
};

// ----------------------------------------------------------------- admin ---

const adminGetAllCampaigns: Handler = async (ctx) => {
  requireAdmin(ctx);
  const page = Math.max(1, Number(ctx.param('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(ctx.param('limit')) || 20));
  const search = String(ctx.param('search') ?? '').trim();
  const status = ctx.param('status');
  const clauses = ['1 = 1'];
  const params: unknown[] = [];
  if (search) {
    clauses.push('(c.name LIKE ? OR c.platform LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status && status !== 'all') {
    clauses.push('c.status = ?');
    params.push(status);
  }
  const where = clauses.join(' AND ');
  const total = (await ctx.db.value<number>(`SELECT COUNT(*) FROM campaigns c WHERE ${where}`, ...params)) ?? 0;
  const campaigns = await campaignsWithRefs(ctx, `${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`, ...params, limit, (page - 1) * limit);
  return {
    success: true,
    campaigns: campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      artist: c.artists?.stage_name || 'Unknown Artist',
      type: c.type,
      platform: c.platform,
      status: c.status,
      budget: c.budget,
      spent: c.spent,
      reach: '0',
      engagement: '0',
      startDate: c.start_date,
      endDate: c.end_date,
      paymentStatus: c.payment_status,
      paymentAmount: c.payment_amount,
      paymentReference: c.payment_reference,
      campaignAssets: c.campaign_assets,
      campaignBrief: c.campaign_brief,
      targetAudience: c.target_audience,
      socialLinks: c.social_links,
      adminNotes: c.admin_notes,
      rejectionReason: c.rejection_reason,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

const adminUpdateCampaignStatus: Handler = async (ctx) => {
  const admin = requireAdmin(ctx);
  const { campaignId, status, adminNotes, rejectionReason } = ctx.body;
  if (!campaignId || !status) throw fail(400, 'Campaign ID and status are required');
  const old = await ctx.db.first('campaigns', 'SELECT status FROM campaigns WHERE id = ?', campaignId);
  if (!old) throw fail(404, 'Campaign not found');
  const patch: Row = { status };
  if (adminNotes !== undefined) patch.admin_notes = adminNotes;
  if (rejectionReason !== undefined) patch.rejection_reason = rejectionReason;
  const [campaign] = await ctx.db.update('campaigns', patch, 'id = ?', campaignId);
  await audit(ctx.db, admin.userId, 'update_campaign_status', 'campaign', campaignId, {
    old_status: old.status,
    new_status: status,
    admin_notes: adminNotes,
    rejection_reason: rejectionReason,
  });
  ctx.waitUntil(
    emailUser(
      ctx.env,
      ctx.db,
      campaign.user_id,
      `Campaign Update: ${campaign.name}`,
      (p) => templates.campaignStatus(ctx.env.APP_URL, p.full_name || 'there', campaign.name, old.status, status, rejectionReason),
      'campaign_updates',
    ),
  );
  return { success: true, campaign };
};

const BULK: Record<string, { status: string; title: string; type: string; message: (name: string, reason?: string) => string }> = {
  approve: { status: 'Active', title: 'Campaign Approved', type: 'success', message: (n) => `Your campaign "${n}" has been approved and is now active.` },
  reject: { status: 'Rejected', title: 'Campaign Rejected', type: 'error', message: (n, r) => `Your campaign "${n}" has been rejected. ${r ?? ''}`.trim() },
  pause: { status: 'Paused', title: 'Campaign Paused', type: 'info', message: (n) => `Your campaign "${n}" has been paused.` },
  activate: { status: 'Active', title: 'Campaign Activated', type: 'success', message: (n) => `Your campaign "${n}" has been activated.` },
};

const adminBulkUpdateCampaigns: Handler = async (ctx) => {
  const admin = requireAdmin(ctx);
  const { campaignIds, action, rejectionReason } = ctx.body;
  if (!Array.isArray(campaignIds) || campaignIds.length === 0) throw fail(400, 'Campaign IDs array is required');
  const ids = inList(campaignIds);
  if (action === 'delete') {
    await ctx.db.run(`DELETE FROM campaigns WHERE id IN ${ids.sql}`, ...ids.params);
    await audit(ctx.db, admin.userId, 'bulk_delete_campaigns', 'campaign', null, { campaign_ids: campaignIds, count: campaignIds.length });
    return { success: true, deleted: campaignIds.length };
  }
  const rule = BULK[action];
  if (!rule) throw fail(400, 'Invalid action');
  const patch: Row = { status: rule.status, ...(action === 'reject' && rejectionReason ? { rejection_reason: rejectionReason } : {}) };
  const campaigns = await ctx.db.update('campaigns', patch, `id IN ${ids.sql}`, ...ids.params);
  await ctx.db.batch(
    await Promise.all(
      campaigns.map((c) =>
        ctx.db.insertStmt('notifications', {
          user_id: c.user_id,
          title: rule.title,
          message: rule.message(c.name, rejectionReason),
          type: rule.type,
          related_type: 'campaign',
          related_id: c.id,
        }),
      ),
    ),
  );
  await audit(ctx.db, admin.userId, `bulk_${action}_campaigns`, 'campaign', null, {
    campaign_ids: campaignIds,
    count: campaignIds.length,
    status: rule.status,
    rejection_reason: rejectionReason,
  });
  return { success: true, updated: campaigns.length };
};

const SERVICES: [string, string, number][] = [
  ['Apple Music Playlist Pitching', 'Streaming & Playlist Promotion', 50000],
  ['Spotify Playlist Pitching', 'Streaming & Playlist Promotion', 30000],
  ['Curator Playlist Placement', 'Streaming & Playlist Promotion', 40000],
  ['Spotify Canvas Activation', 'Streaming & Playlist Promotion', 40000],
  ['Audiomack Playlist', 'Streaming & Playlist Promotion', 50000],
  ['Spotify Playlist', 'Streaming & Playlist Promotion', 50000],
  ['Apple Music Playlist', 'Streaming & Playlist Promotion', 100000],
  ['Boomplay Playlist', 'Streaming & Playlist Promotion', 20000],
  ['Lyrics Video', 'Streaming & Playlist Promotion', 100000],
  ['Influencer Marketing Activation / Consultation', 'Digital & Social Media Marketing', 50000],
  ['TikTok Challenge Setup', 'Digital & Social Media Marketing', 1000000],
  ['Behind-The-Scenes Content Shoot', 'Digital & Social Media Marketing', 200000],
  ['Press Releases', 'Press & Media Promotions', 150000],
  ['Blog Features', 'Press & Media Promotions', 150000],
  ['Magazine Interviews', 'Press & Media Promotions', 300000],
  ['TV Features', 'Press & Media Promotions', 300000],
  ['Press Run', 'Press & Media Promotions', 2000000],
  ['Wikipedia Setup', 'Press & Media Promotions', 250000],
  ['Radio Airplay', 'Radio Promotions', 300000],
  ['Radio Spin Campaign', 'Radio Promotions', 1000000],
  ['Radio Interviews', 'Radio Promotions', 300000],
  ['Podcast Features', 'Interviews & Appearances', 200000],
  ['YouTube Talk Shows', 'Interviews & Appearances', 300000],
  ['Twitter Spaces', 'Interviews & Appearances', 200000],
  ['Listening Party Setup', 'Events & Experiences', 3000000],
  ['Club Performances', 'Events & Experiences', 3000000],
  ['Email Marketing', 'Direct Marketing', 50000],
];

const STARTER = ['Apple Music Playlist Pitching', 'Spotify Playlist Pitching', 'Curator Playlist Placement', 'Lyrics Video'];
const GROWTH = [...STARTER, 'Press Releases', 'Radio Interviews', 'Twitter Spaces'];
const MOMENTUM = [
  ...GROWTH, 'Blog Features', 'Magazine Interviews', 'TV Features', 'Influencer Marketing Activation / Consultation',
  'Behind-The-Scenes Content Shoot', 'Audiomack Playlist', 'Spotify Playlist', 'Apple Music Playlist', 'Boomplay Playlist',
];
const SUPERNOVA = [
  ...MOMENTUM, 'Press Run', 'Radio Airplay', 'Radio Spin Campaign', 'Podcast Features', 'YouTube Talk Shows',
  'Listening Party Setup', 'Club Performances', 'Wikipedia Setup', 'Email Marketing',
];
const BUNDLES: [string, string, string, number, number, string[]][] = [
  ['Starter Junket', 'starter-junket', 'Entry-level digital visibility for emerging artists', 500000, 1, STARTER],
  ['Growth Junket', 'growth-junket', 'Balanced media exposure and streaming growth', 1000000, 2, GROWTH],
  ['Momentum Junket', 'momentum-junket', 'Multi-platform growth and strong media penetration', 3000000, 3, MOMENTUM],
  ['Supernova Junket', 'supernova-junket', 'Comprehensive industry domination campaign for high-tier artists', 5000000, 4, SUPERNOVA],
];

const seedPromotionServices: Handler = async (ctx) => {
  requireAdmin(ctx);
  const services = await ctx.db.batch(
    await Promise.all(
      SERVICES.map(([name, category, price], i) =>
        ctx.db.upsertStmt('promotion_services', { name, category, price, sort_order: i + 1, updated_at: now() }, ['name']),
      ),
    ),
  );
  const serviceId = new Map<string, string>();
  for (const r of services) {
    const row = (r.results as Row[])[0];
    if (row) serviceId.set(row.name, row.id);
  }
  for (const [name, slug, description, price, tier_level, included] of BUNDLES) {
    const bundle = await ctx.db.upsert(
      'promotion_bundles',
      { name, slug, description, target_description: description, price, tier_level, updated_at: now() },
      ['slug'],
    );
    await ctx.db.batch(
      await Promise.all(
        included
          .filter((s) => serviceId.has(s))
          .map((s) => ctx.db.upsertStmt('bundle_services', { bundle_id: bundle.id, service_id: serviceId.get(s)! }, ['bundle_id', 'service_id'], true)),
      ),
    );
  }
  return { success: true, message: `Seeded ${SERVICES.length} services and ${BUNDLES.length} bundles` };
};

export const campaignFunctions: Record<string, Handler> = {
  'get-user-campaigns': getUserCampaigns,
  'create-campaign': createCampaign,
  'pause-campaign': pauseCampaign,
  'get-campaign-performance': getCampaignPerformance,
  'paystack-initialize-campaign-payment': initializeCampaignPayment,
  'admin-get-all-campaigns': adminGetAllCampaigns,
  'admin-update-campaign-status': adminUpdateCampaignStatus,
  'admin-bulk-update-campaigns': adminBulkUpdateCampaigns,
  'seed-promotion-services': seedPromotionServices,
};
