import { sendUserPush } from '../lib/push';
import type { Env } from '../env';
import { DB, type Row } from '../lib/db';
import { sendEmailSafe } from '../lib/email';

export const artistOfUser = (db: DB, userId: string) =>
  db.first('artists', 'SELECT * FROM artists WHERE user_id = ? ORDER BY created_at LIMIT 1', userId);

export const profileOf = (db: DB, userId: string) => db.first('profiles', 'SELECT * FROM profiles WHERE id = ?', userId);

export const isLabelOf = async (db: DB, labelId: string, artistId: string) =>
  Boolean(await db.value("SELECT 1 FROM label_artists WHERE label_id = ? AND artist_id = ? AND status = 'active'", labelId, artistId));

export async function notify(
  db: DB,
  userId: string,
  n: { title: string; message: string; type?: string; related_type?: string; related_id?: string },
  env?: Env,
) {
  const prefs = await db.first('notification_preferences', 'SELECT * FROM notification_preferences WHERE user_id = ?', userId);
  const topic = n.related_type === 'release' ? 'release_updates' : n.related_type === 'campaign' ? 'campaign_updates' : n.related_type === 'earnings' ? 'earnings_alerts' : undefined;
  if (topic && prefs && !prefs[topic]) return null;
  const result = !prefs || prefs.in_app_notifications ? await db.insert('notifications', { user_id: userId, type: 'info', ...n }) : null;
  if (env) await sendUserPush(env, db, userId, n.title, n.message, topic);
  return result;
}

export async function audit(db: DB, adminId: string, action: string, targetType: string, targetId: string | null, metadata: Row = {}) {
  return db.insert('admin_audit_logs', { admin_id: adminId, action, target_type: targetType, target_id: targetId, metadata });
}

/**
 * Email a user unless they opted out. `pref` names the per-topic toggle that must also be on.
 * Missing preferences mean "send" (same as the old functions).
 */
export async function emailUser(env: Env, db: DB, userId: string, subject: string, html: (p: Row) => string, pref?: string) {
  const profile = await profileOf(db, userId);
  if (!profile?.email) return;
  const prefs = await db.first('notification_preferences', 'SELECT * FROM notification_preferences WHERE user_id = ?', userId);
  if (prefs && (!prefs.email_notifications || (pref && !prefs[pref]))) return;
  await sendEmailSafe(env, profile.email, subject, html(profile));
}

export function periodStart(period: string | number | undefined, fallbackDays = 30): Date {
  const d = new Date();
  switch (String(period ?? '')) {
    case '7days':
      d.setDate(d.getDate() - 7);
      break;
    case '90days':
      d.setDate(d.getDate() - 90);
      break;
    case 'year':
      d.setFullYear(d.getFullYear() - 1);
      break;
    case '30days':
    case '':
      d.setDate(d.getDate() - fallbackDays);
      break;
    default: {
      const days = parseInt(String(period), 10);
      d.setDate(d.getDate() - (Number.isFinite(days) && days > 0 ? days : fallbackDays));
    }
  }
  return d;
}

/** Subscription status shape the apps expect (get-user-subscriptions / get-subscription-status). */
export function decorateSubscription(sub: any, nowMs = Date.now()): any {
  const trialEnded = Boolean(sub.trial_ends_at && Date.parse(sub.trial_ends_at) < nowMs);
  const periodEnded = Boolean(sub.current_period_end && Date.parse(sub.current_period_end) < nowMs);
  const isActive = (sub.status === 'active' && !periodEnded) || (sub.status === 'trial' && !trialEnded);
  const isTrial = sub.status === 'trial' && !trialEnded;
  const end = isTrial ? sub.trial_ends_at : isActive ? sub.current_period_end : null;
  const daysRemaining = end ? Math.ceil((Date.parse(end) - nowMs) / 86400_000) : 0;
  return { ...sub, isActive, isTrial, trialEnded, periodEnded, daysRemaining };
}
