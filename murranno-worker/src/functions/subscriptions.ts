import { isAllowedUrl } from '../lib/guard';
import { kobo, now, type Row } from '../lib/db';
import { templates } from '../lib/email';
import { paystack, paystackReference } from '../lib/paystack';
import { applyCharge } from '../payments';
import { fail, requireAdmin, requireUser, type FnCtx, type Handler } from './context';
import { audit, decorateSubscription, emailUser } from './shared';

const PAID_TIERS = ['label', 'agency'];
const TIERS = ['artist', 'label', 'agency', 'admin'];

const getSubscriptionPlans: Handler = async (ctx) => {
  const plans = await ctx.db.all('subscription_plans', 'SELECT * FROM subscription_plans ORDER BY price_monthly ASC');
  const current = ctx.auth
    ? await ctx.db.first('subscriptions', 'SELECT tier, status FROM subscriptions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1', ctx.auth.userId)
    : null;
  return { success: true, plans, currentTier: current?.tier ?? null, currentStatus: current?.status ?? null };
};

async function subscriptionSummary(ctx: FnCtx) {
  const { userId } = requireUser(ctx);
  const subs = await ctx.db.all('subscriptions', 'SELECT * FROM subscriptions WHERE user_id = ?', userId);
  const plans = await ctx.db.all('subscription_plans', 'SELECT * FROM subscription_plans');
  const subscriptions = subs.map((s) => {
    const plan = plans.find((p) => p.tier === s.tier);
    return decorateSubscription({
      ...s,
      subscription_plans: plan
        ? { name: plan.name, price_monthly: plan.price_monthly, currency: plan.currency, max_artists: plan.max_artists, features: plan.features }
        : null,
    });
  });
  const accessibleTiers = ['artist', ...subscriptions.filter((s) => s.isActive).map((s) => s.tier)];
  return {
    success: true,
    subscriptions,
    accessibleTiers,
    hasLabelAccess: accessibleTiers.includes('label'),
    hasAgencyAccess: accessibleTiers.includes('agency'),
  };
}

const initializeSubscription: Handler = async (ctx) => {
  const { userId, email } = requireUser(ctx);
  const { tier, full_name } = ctx.body;
  if (!PAID_TIERS.includes(tier)) throw fail(400, 'Invalid tier. Only label and agency require subscription.');
  const plan = await ctx.db.first('subscription_plans', 'SELECT * FROM subscription_plans WHERE tier = ?', tier);
  if (!plan) throw fail(404, 'Subscription plan not found');
  const existing = decorateSubscription(
    (await ctx.db.first('subscriptions', 'SELECT * FROM subscriptions WHERE user_id = ? AND tier = ?', userId, tier)) ?? {},
  );
  if (existing.isActive && existing.status === 'active') throw fail(400, 'You already have an active subscription for this tier');

  if (plan.price_monthly === 0) {
    await ctx.db.upsert(
      'subscriptions',
      {
        user_id: userId,
        tier,
        status: 'active',
        trial_ends_at: null,
        current_period_start: now(),
        current_period_end: new Date(Date.now() + 30 * 86400_000).toISOString(),
      },
      ['user_id', 'tier'],
    );
    return { success: true, message: `${tier} access activated`, redirect_url: tier === 'label' ? '/app/label-dashboard' : '/app/agency-dashboard' };
  }

  const callback = new URL('/functions/v1/paystack-verify-subscription', ctx.req.url);
  if (ctx.body.redirectTo && isAllowedUrl(ctx.env, ctx.body.redirectTo)) callback.searchParams.set('return_to', ctx.body.redirectTo);

  // The account email is used for the charge; the client-supplied one is ignored.
  const res = await paystack(ctx.env, '/transaction/initialize', {
    body: {
      email,
      amount: kobo(plan.price_monthly),
      currency: plan.currency || 'NGN',
      reference: paystackReference('SUB'),
      metadata: { user_id: userId, tier, full_name: full_name ?? '', subscription: true },
      callback_url: callback.toString(),
    },
  });
  if (!res.status) throw fail(400, res.message || 'Payment initialization failed');
  return { authorization_url: res.data.authorization_url, access_code: res.data.access_code, reference: res.data.reference };
};

/** Paystack redirects the browser here (GET ?reference=) after checkout; also callable with POST { reference }. */
const verifySubscription: Handler = async (ctx) => {
  const reference = ctx.param('reference') ?? ctx.param('trxref');
  if (!reference) throw fail(400, 'Payment reference is required');
  let result;
  try { result = await applyCharge(ctx.env, ctx.db, String(reference)); }
  catch (error) {
    if (ctx.req.method !== 'GET') throw error;
  }
  const done = result?.kind === 'subscription';
  if (ctx.req.method === 'GET') {
    const candidate = ctx.param('return_to');
    const target = new URL(candidate && isAllowedUrl(ctx.env, candidate) ? candidate : new URL('/app/dashboard', ctx.env.APP_URL).toString());
    target.searchParams.set('reference', String(reference));
    target.searchParams.set('subscription', done ? 'success' : 'failed');
    return Response.redirect(target.toString(), 303);
  }
  if (!done) throw fail(400, 'Payment verification failed');
  return { success: true, message: 'Subscription activated successfully', tier: result?.tier };

};

function subscriptionEmail(action: string, s: Row): [string, string] | null {
  const until = s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : 'the end of your billing period';
  const copy: Record<string, [string, string]> = {
    grant: [`Your ${s.tier} Access Has Been Granted!`, `Your ${s.tier} tier access has been activated by an admin. You can now enjoy all the features of this plan.`],
    extend: [`Your ${s.tier} Access Has Been Extended`, `Good news! Your ${s.tier} subscription has been extended until ${until}.`],
    cancel: [`Your ${s.tier} Subscription Has Been Cancelled`, `Your ${s.tier} subscription has been cancelled. You'll continue to have access until ${until}.`],
    refund: [`Your ${s.tier} Subscription Has Been Refunded`, `Your ${s.tier} subscription has been refunded and cancelled. Any charges will be returned to your payment method.`],
  };
  return copy[action] ?? null;
}

const adminManageSubscription: Handler = async (ctx) => {
  const admin = requireAdmin(ctx);
  const { action, subscription_id, user_id, tier, duration_months, admin_notes, trial_days } = ctx.body;
  const months = Math.max(1, Number(duration_months) || 1);
  let result: Row | null;
  const ts = new Date();
  switch (action) {
    case 'grant': {
      if (!user_id || !TIERS.includes(tier)) throw fail(400, 'user_id and a valid tier are required');
      const end = new Date(ts);
      end.setMonth(end.getMonth() + months);
      const trialEnd = trial_days ? new Date(ts.getTime() + Number(trial_days) * 86400_000).toISOString() : null;
      result = await ctx.db.upsert(
        'subscriptions',
        {
          user_id,
          tier,
          status: trial_days ? 'trial' : 'active',
          current_period_start: ts.toISOString(),
          current_period_end: end.toISOString(),
          trial_ends_at: trialEnd,
          cancelled_at: null,
          admin_notes: admin_notes ?? null,
          manually_managed: true,
        },
        ['user_id', 'tier'],
      );
      await ctx.db.run('UPDATE user_roles SET tier = ? WHERE user_id = ?', tier, user_id);
      break;
    }
    case 'extend': {
      const existing = await ctx.db.first('subscriptions', 'SELECT * FROM subscriptions WHERE id = ?', subscription_id);
      if (!existing) throw fail(404, 'Subscription not found');
      const end = new Date(existing.current_period_end && Date.parse(existing.current_period_end) > ts.getTime() ? existing.current_period_end : ts);
      end.setMonth(end.getMonth() + months);
      [result] = await ctx.db.update(
        'subscriptions',
        { current_period_end: end.toISOString(), admin_notes: admin_notes ?? existing.admin_notes, manually_managed: true },
        'id = ?',
        subscription_id,
      );
      break;
    }
    case 'cancel':
    case 'refund':
      [result] = await ctx.db.update(
        'subscriptions',
        {
          status: 'cancelled',
          cancelled_at: ts.toISOString(),
          ...(action === 'refund' ? { refunded_at: ts.toISOString() } : {}),
          ...(admin_notes !== undefined ? { admin_notes } : {}),
        },
        'id = ?',
        subscription_id,
      );
      if (!result) throw fail(404, 'Subscription not found');
      break;
    default:
      throw fail(400, 'Invalid action');
  }

  await audit(ctx.db, admin.userId, `subscription_${action}`, 'subscription', result?.id ?? null, { action, tier, duration_months, admin_notes });
  const copy = result && subscriptionEmail(action, result);
  if (copy && result) {
    ctx.waitUntil(emailUser(ctx.env, ctx.db, result.user_id, copy[0], (p) => templates.subscriptionStatus(p.full_name || 'there', copy[0], copy[1], result!.admin_notes)));
  }
  return { success: true, data: result };
};

export const subscriptionFunctions: Record<string, Handler> = {
  'get-subscription-plans': getSubscriptionPlans,
  'get-subscription-status': subscriptionSummary,
  'get-user-subscriptions': subscriptionSummary,
  'paystack-initialize-subscription': initializeSubscription,
  'paystack-verify-subscription': verifySubscription,
  'admin-manage-subscription': adminManageSubscription,
};
