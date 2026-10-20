import { sendUserPush } from '../lib/push';
import { inList, naira, type Row } from '../lib/db';
import { sendBroadcast, templates } from '../lib/email';
import { fail, requireAdmin, type Handler } from './context';
import { audit, emailUser, notify } from './shared';

const TIERS = ['artist', 'label', 'agency', 'admin'];
const RELEASE_STATUSES = ['Draft', 'Pending', 'Published', 'Rejected', 'Takedown'];
const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';
const AUDIENCE_TIER: Record<string, string | null> = { all: null, artists: 'artist', labels: 'label', agencies: 'agency' };

const adminGetAllUsers: Handler = async (ctx) => {
  const admin = requireAdmin(ctx);
  const page = Math.max(1, parseInt(String(ctx.param('page') ?? '1'), 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(String(ctx.param('limit') ?? '50'), 10) || 50));
  const search = String(ctx.param('search') ?? '').trim();
  const tier = String(ctx.param('tier') ?? '');
  const status = String(ctx.param('status') ?? '');
  const clauses = ['1 = 1'];
  const params: unknown[] = [];
  if (search) {
    clauses.push('(p.email LIKE ? OR p.full_name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (tier) {
    clauses.push('EXISTS (SELECT 1 FROM user_roles r WHERE r.user_id = p.id AND r.tier = ?)');
    params.push(tier);
  }
  if (status) {
    clauses.push('EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = p.id AND s.status = ?)');
    params.push(status);
  }
  const where = clauses.join(' AND ');
  const total = (await ctx.db.value<number>(`SELECT COUNT(*) FROM profiles p WHERE ${where}`, ...params)) ?? 0;
  const profiles = await ctx.db.all(
    'profiles',
    `SELECT p.id, p.email, p.full_name, p.created_at, p.updated_at, p.banned, p.ban_reason, p.kyc_status
     FROM profiles p WHERE ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
    ...params,
    limit,
    (page - 1) * limit,
  );
  const ids = inList(profiles.map((p) => p.id));
  const roles = await ctx.db.all('user_roles', `SELECT * FROM user_roles WHERE user_id IN ${ids.sql}`, ...ids.params);
  const subs = await ctx.db.all('subscriptions', `SELECT * FROM subscriptions WHERE user_id IN ${ids.sql}`, ...ids.params);
  await audit(ctx.db, admin.userId, 'VIEW_ALL_USERS', 'users', null, { page, limit, search, tier, status });
  return {
    success: true,
    users: profiles.map((p) => ({
      ...p,
      user_roles: roles.filter((r) => r.user_id === p.id),
      subscriptions: subs.filter((s) => s.user_id === p.id),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const adminUpdateUserRole: Handler = async (ctx) => {
  const admin = requireAdmin(ctx);
  const { userId, newTier } = ctx.body;
  if (!userId || !TIERS.includes(newTier)) throw fail(400, 'userId and a valid newTier are required');
  if (userId === admin.userId && newTier !== 'admin') throw fail(400, 'You cannot remove your own admin role');
  const updated = await ctx.db.update('user_roles', { tier: newTier }, 'user_id = ?', userId);
  if (!updated.length) throw fail(404, 'User not found');
  await audit(ctx.db, admin.userId, 'UPDATE_USER_ROLE', 'user', userId, { newTier });
  return { success: true };
};

const adminManageTeam: Handler = async (ctx) => {
  const admin = requireAdmin(ctx);
  const { action, email, userId } = ctx.body;
  if (action === 'add') {
    if (!email) throw fail(400, 'Email is required for add action');
    const target = await ctx.db.first('profiles', 'SELECT id FROM profiles WHERE email = ? COLLATE NOCASE', String(email).trim());
    if (!target) throw fail(404, 'User not found with this email');
    await ctx.db.upsert('user_roles', { user_id: target.id, tier: 'admin' }, ['user_id']);
    await audit(ctx.db, admin.userId, 'ADD_ADMIN', 'user', target.id, { email });
    return { success: true, message: `User ${email} is now an admin` };
  }
  if (action === 'remove') {
    if (!userId) throw fail(400, 'UserId is required for remove action');
    if (userId === admin.userId) throw fail(400, 'You cannot remove yourself from the admin team');
    await ctx.db.update('user_roles', { tier: 'artist' }, "user_id = ? AND tier = 'admin'", userId);
    await audit(ctx.db, admin.userId, 'REMOVE_ADMIN', 'user', userId);
    return { success: true, message: 'Admin role removed' };
  }
  throw fail(400, 'Invalid action');
};

const adminModerateRelease: Handler = async (ctx) => {
  const admin = requireAdmin(ctx);
  const { releaseId, status, reason } = ctx.body;
  if (!releaseId || !status) throw fail(400, 'releaseId and status are required');
  if (!RELEASE_STATUSES.includes(status)) throw fail(400, `status must be one of ${RELEASE_STATUSES.join(', ')}`);
  const [release] = await ctx.db.update('releases', { status }, 'id = ?', releaseId);
  if (!release) throw fail(404, 'Release not found');
  await audit(ctx.db, admin.userId, 'MODERATE_RELEASE', 'release', releaseId, { status, reason });

  const artist = await ctx.db.first('artists', 'SELECT stage_name, user_id FROM artists WHERE id = ?', release.artist_id);
  if (artist?.user_id) {
    const message =
      status === 'Published'
        ? `Your release "${release.title}" has been approved and will be distributed on ${new Date(release.release_date).toLocaleDateString()}.`
        : status === 'Rejected'
          ? `Your release "${release.title}" was rejected. ${reason || 'Please review and resubmit.'}`
          : `Your release "${release.title}" status has been updated to ${status}.`;
    await notify(ctx.db, artist.user_id, {
      title: status === 'Published' ? 'Release Approved' : status === 'Rejected' ? 'Release Rejected' : 'Release Updated',
      message,
      type: status === 'Published' ? 'success' : status === 'Rejected' ? 'error' : 'info',
      related_type: 'release',
      related_id: releaseId,
    }, ctx.env);
    ctx.waitUntil(
      emailUser(
        ctx.env,
        ctx.db,
        artist.user_id,
        `Release Update: ${release.title}`,
        () => templates.releaseStatus(ctx.env.APP_URL, artist.stage_name, release.title, status, release.release_date, reason),
        'release_updates',
      ),
    );
  }
  return { success: true };
};

const adminGetPlatformAnalytics: Handler = async (ctx) => {
  const admin = requireAdmin(ctx);
  const count = (sql: string) => ctx.db.value<number>(sql).then((n) => n ?? 0);
  const tiers = await ctx.db.d1.prepare('SELECT tier, COUNT(*) AS n FROM user_roles GROUP BY tier').all<{ tier: string; n: number }>();
  const totalEarnings = naira(await ctx.db.value<number>("SELECT COALESCE(SUM(amount), 0) FROM earnings WHERE status = 'paid'"));
  const totalWithdrawals = naira(await ctx.db.value<number>("SELECT COALESCE(SUM(amount), 0) FROM withdrawal_transactions WHERE status = 'completed'"));
  await audit(ctx.db, admin.userId, 'VIEW_PLATFORM_ANALYTICS', 'analytics', null);
  return {
    success: true,
    analytics: {
      totalUsers: await count('SELECT COUNT(*) FROM profiles'),
      activeSubscriptions: await count("SELECT COUNT(*) FROM subscriptions WHERE status IN ('active', 'trial')"),
      totalReleases: await count('SELECT COUNT(*) FROM releases'),
      totalCampaigns: await count('SELECT COUNT(*) FROM campaigns'),
      totalEarnings,
      totalWithdrawals,
      platformRevenue: totalEarnings - totalWithdrawals,
      tierDistribution: Object.fromEntries(tiers.results.map((t) => [t.tier, t.n])),
    },
  };
};

const getPlatformSettings: Handler = async (ctx) => {
  requireAdmin(ctx);
  const settings =
    (await ctx.db.first('platform_settings', 'SELECT * FROM platform_settings WHERE id = ?', SETTINGS_ID)) ??
    (await ctx.db.upsert('platform_settings', { id: SETTINGS_ID }, ['id']));
  return { success: true, settings };
};

/** App field name -> column. */
const SETTINGS_FIELDS: Record<string, string> = {
  platformName: 'platform_name',
  supportEmail: 'support_email',
  autoApproveUploads: 'auto_approve_uploads',
  contentModerationEnabled: 'content_moderation_enabled',
  maintenanceMode: 'maintenance_mode',
  restrictedWords: 'restricted_words',
  maxUploadsPerMonth: 'max_uploads_per_month',
  maxFileSize: 'max_file_size_mb',
  paymentProcessor: 'payment_processor',
  minimumPayout: 'minimum_payout_amount',
  payoutSchedule: 'payout_schedule',
  platformFee: 'platform_fee_percentage',
  usdToNgnRate: 'usd_to_ngn_rate',
  emailNotifications: 'email_notifications_enabled',
  smsNotifications: 'sms_notifications_enabled',
  helpCenterUrl: 'help_center_url',
  contactPhone: 'contact_phone',
  contactEmail: 'contact_email',
  termsUrl: 'terms_url',
  privacyUrl: 'privacy_url',
  socialInstagram: 'social_instagram',
  socialTwitter: 'social_twitter',
  socialFacebook: 'social_facebook',
  socialLinkedin: 'social_linkedin',
};

const updatePlatformSettings: Handler = async (ctx) => {
  const admin = requireAdmin(ctx);
  const settings = ctx.body.settings as Row | undefined;
  if (!settings) throw fail(400, 'Settings data required');
  const patch: Row = {};
  for (const [field, column] of Object.entries(SETTINGS_FIELDS)) if (settings[field] !== undefined) patch[column] = settings[field];
  await ctx.db.upsert('platform_settings', { id: SETTINGS_ID }, ['id']);
  const [data] = await ctx.db.update('platform_settings', patch, 'id = ?', SETTINGS_ID);
  await audit(ctx.db, admin.userId, 'update_platform_settings', 'platform_settings', SETTINGS_ID, { updated_fields: Object.keys(settings) });
  return { success: true, settings: data };
};

/** Recipients for an audience: user ids, plus the emails of those who allow (marketing) email. */
async function audience(ctx: Parameters<Handler>[0], key: string, marketing: boolean) {
  if (!(key in AUDIENCE_TIER)) throw fail(400, 'Invalid audience');
  const tier = AUDIENCE_TIER[key];
  const { results } = await ctx.db.d1
    .prepare(
      `SELECT r.user_id, p.email,
              COALESCE(np.email_notifications, 1) AS email_ok, COALESCE(np.marketing_emails, 0) AS marketing_ok
       FROM user_roles r JOIN profiles p ON p.id = r.user_id
       LEFT JOIN notification_preferences np ON np.user_id = r.user_id
       WHERE p.banned IS NOT 1 ${tier ? 'AND r.tier = ?' : ''}`,
    )
    .bind(...(tier ? [tier] : []))
    .all<{ user_id: string; email: string; email_ok: number; marketing_ok: number }>();
  return {
    userIds: results.map((r) => r.user_id),
    emails: results.filter((r) => r.email_ok && (!marketing || r.marketing_ok)).map((r) => r.email),
  };
}

const sendNotification: Handler = async (ctx) => {
  requireAdmin(ctx);
  const { title, message, type, targetAudience } = ctx.body;
  if (!title || !message) throw fail(400, 'title and message are required');
  const { userIds, emails } = await audience(ctx, targetAudience ?? 'all', false);
  let notificationsSent = 0;
  let pushTokens = 0;
  for (const userId of userIds) {
    const prefs = await ctx.db.first('notification_preferences', 'SELECT * FROM notification_preferences WHERE user_id = ?', userId);
    if (!prefs || prefs.in_app_notifications) { await ctx.db.insert('notifications', {user_id: userId, title, message, type: type || 'info'}); notificationsSent++; }
    pushTokens += await sendUserPush(ctx.env, ctx.db, userId, title, message);
  }
  ctx.waitUntil(sendBroadcast(ctx.env, emails, title, templates.broadcast(title, message)));
  return { success: true, notificationsSent, emailsSent: emails.length, pushNotificationsSent: pushTokens };
};

const sendBatchEmail: Handler = async (ctx) => {
  requireAdmin(ctx);
  const { subject, body, audience: target } = ctx.body;
  if (!subject || !body) throw fail(400, 'subject and body are required');
  const { emails } = await audience(ctx, target ?? 'all', true);
  ctx.waitUntil(sendBroadcast(ctx.env, emails, subject, templates.broadcast(subject, body)));
  return { success: true, message: `Queued ${subject} for ${emails.length} recipients` };
};

export const adminFunctions: Record<string, Handler> = {
  'admin-get-all-users': adminGetAllUsers,
  'admin-update-user-role': adminUpdateUserRole,
  'admin-manage-team': adminManageTeam,
  'admin-moderate-release': adminModerateRelease,
  'admin-get-platform-analytics': adminGetPlatformAnalytics,
  'get-platform-settings': getPlatformSettings,
  'update-platform-settings': updatePlatformSettings,
  'send-notification': sendNotification,
  'send-batch-email': sendBatchEmail,
};
