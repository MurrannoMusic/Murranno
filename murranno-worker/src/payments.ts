import type { Env } from './env';
import { DB, kobo, now, type Row } from './lib/db';
import { metadataOf, paystack } from './lib/paystack';

/** Current catalogue price of a campaign: its bundle, or the sum of its attached services (naira). */
export async function campaignTotal(db: DB, campaign: Row): Promise<number> {
  if (campaign.bundle_id) {
    return (await db.first('promotion_bundles', 'SELECT price FROM promotion_bundles WHERE id = ?', campaign.bundle_id))?.price ?? 0;
  }
  const services = await db.all(
    'promotion_services',
    'SELECT ps.price FROM campaign_services cs JOIN promotion_services ps ON ps.id = cs.service_id WHERE cs.campaign_id = ?',
    campaign.id,
  );
  return services.reduce((t, s) => t + s.price, 0);
}

const addMonths = (d: Date, n: number) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
};

/**
 * Apply a successful Paystack charge exactly once (webhook and redirect may both arrive).
 * The transaction is re-fetched from Paystack so only verified data is trusted, and the amount
 * paid must cover the current price before anything is activated.
 */
export async function applyCharge(env: Env, db: DB, reference: string): Promise<{ applied: boolean; kind?: string; tier?: string }> {
  const verify = await paystack(env, `/transaction/verify/${encodeURIComponent(reference)}`);
  const tx = verify.data;
  if (!verify.status || tx?.status !== 'success') return { applied: false };
  const meta = metadataOf(tx);
  const paidKobo = Number(tx.amount);
  const userId = meta.user_id;
  if (!userId) return { applied: false };

  if (meta.subscription) {
    const plan = await db.first('subscription_plans', 'SELECT * FROM subscription_plans WHERE tier = ?', meta.tier);
    if (!plan || tx.currency !== (plan.currency || 'NGN') || paidKobo < kobo(plan.price_monthly)) {
      console.error('subscription charge below plan price', reference, paidKobo);
      return { applied: false };
    }
    const start = new Date();
    const record = await db.upsertStmt(
      'payments',
      { reference, user_id: userId, kind: 'subscription', amount: paidKobo / 100, metadata: meta },
      ['reference'],
      true,
    );
    const [recorded] = await db.batch([
      record,
      db.stmt(
        `INSERT INTO subscriptions (id, user_id, tier, status, current_period_start, current_period_end, trial_ends_at, cancelled_at, created_at, updated_at)
         SELECT ?, ?, ?, 'active', ?, ?, NULL, NULL, ?, ? WHERE changes() = 1
         ON CONFLICT (user_id, tier) DO UPDATE SET status = 'active', current_period_start = excluded.current_period_start,
           current_period_end = excluded.current_period_end, trial_ends_at = NULL, cancelled_at = NULL, updated_at = excluded.updated_at`,
        crypto.randomUUID(),
        userId,
        meta.tier,
        start.toISOString(),
        addMonths(start, 1).toISOString(),
        now(),
        now(),
      ),
    ]);
    return { applied: (recorded.results as Row[]).length === 1, kind: 'subscription', tier: meta.tier };
  }

  if (meta.payment_type === 'campaign' && meta.campaign_id) {
    const campaign = await db.first('campaigns', 'SELECT * FROM campaigns WHERE id = ? AND user_id = ?', meta.campaign_id, userId);
    // Metadata is client-controlled (a charge can be created with the public key), so the charge must be the
    // checkout this server started for this campaign, in NGN, covering today's catalogue price.
    const due = campaign ? Math.max(campaign.payment_amount ?? 0, await campaignTotal(db, campaign)) : 0;
    if (!campaign || campaign.payment_reference !== reference || tx.currency !== 'NGN' || due <= 0 || paidKobo < kobo(due)) {
      console.error('campaign charge does not cover amount due', reference, paidKobo);
      return { applied: false };
    }
    const record = await db.upsertStmt(
      'payments',
      { reference, user_id: userId, kind: 'campaign', amount: paidKobo / 100, metadata: meta },
      ['reference'],
      true,
    );
    const [recorded] = await db.batch([
      record,
      db.stmt(
        "UPDATE campaigns SET status = 'Paid', payment_status = 'paid', payment_reference = ?, updated_at = ? WHERE id = ? AND changes() = 1",
        reference,
        now(),
        campaign.id,
      ),
    ]);
    return { applied: (recorded.results as Row[]).length === 1, kind: 'campaign' };
  }
  return { applied: false };
}
