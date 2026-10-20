import type { Context } from 'hono';
import type { AppEnv, Env } from './env';
import { DB, now } from './lib/db';
import { json } from './lib/http';
import { metadataOf, paystack, verifyPaystackSignature } from './lib/paystack';
import { applyCharge } from './payments';
import { emailWithdrawal, getWithdrawal, releaseDueWithdrawals, sendTransfer, settleWithdrawal } from './functions/withdrawals';

/**
 * Single Paystack webhook (Paystack allows one URL per account): charges for subscriptions and
 * campaigns, and payout transfer outcomes. Non-2xx makes Paystack retry, so failures throw.
 */
export async function paystackWebhook(c: Context<AppEnv>): Promise<Response> {
  const raw = await c.req.text();
  if (!(await verifyPaystackSignature(c.env, raw, c.req.header('x-paystack-signature') ?? null))) {
    return json({ error: 'Invalid signature' }, 401);
  }
  const event = JSON.parse(raw);
  const db = new DB(c.env.DB);
  const data = event.data ?? {};

  switch (event.event) {
    case 'charge.success':
      await applyCharge(c.env, db, data.reference);
      break;
    case 'charge.failed': {
      const meta = metadataOf(data);
      if (meta.payment_type === 'campaign' && meta.campaign_id) {
        // Only the checkout we issued for this campaign can fail it (metadata alone is forgeable).
        await db.run(
          "UPDATE campaigns SET payment_status = 'failed', updated_at = ? WHERE id = ? AND payment_reference = ? AND payment_status != 'paid'",
          now(),
          meta.campaign_id,
          data.reference,
        );
      }
      break;
    }
    case 'transfer.success':
    case 'transfer.failed':
    case 'transfer.reversed':
      await settleTransfer(c.env, db, event.event, data);
      break;
    default:
      console.log('unhandled paystack event', event.event);
  }
  return json({ received: true });
}

async function settleTransfer(env: Env, db: DB, event: string, data: Record<string, any>) {
  const tx = await getWithdrawal(db, 'w.reference = ?', data.reference);
  if (!tx) return;
  const extra = { paystack_response: data, transfer_code: data.transfer_code ?? tx.transfer_code };
  const settled =
    event === 'transfer.success'
      ? await settleWithdrawal(db, tx.id, 'completed', ['processing'], extra)
      : event === 'transfer.failed'
        ? await settleWithdrawal(db, tx.id, 'failed', ['processing'], { ...extra, failure_reason: data.reason || data.failures || 'Transfer failed' })
        : await settleWithdrawal(db, tx.id, 'reversed', ['processing', 'completed'], { ...extra, failure_reason: 'Transfer reversed' });
  // Only the call that changed the status emails, so Paystack retries don't send duplicates.
  if (settled) await emailWithdrawal(env, db, tx.id);
}

/** Withdrawals whose outcome we never heard about (missed webhook / timeout) are re-checked with Paystack. */
async function reconcileProcessing(env: Env, db: DB) {
  const stale = await db.all(
    'withdrawal_transactions',
    "SELECT id, reference, transfer_code FROM withdrawal_transactions WHERE status = 'processing' AND updated_at < ? LIMIT 20",
    new Date(Date.now() - 30 * 60_000).toISOString(),
  );
  for (const w of stale) {
    try {
      const res = await paystack(env, `/transfer/verify/${encodeURIComponent(w.reference)}`);
      const status = res.data?.status;
      if (status === 'success') await settleTransfer(env, db, 'transfer.success', res.data);
      else if (status === 'failed') await settleTransfer(env, db, 'transfer.failed', res.data);
      else if (status === 'reversed') await settleTransfer(env, db, 'transfer.reversed', res.data);
      else if (!res.status && res.httpStatus >= 400 && res.httpStatus < 500 && !w.transfer_code) {
        // Paystack has no such transfer: resend (the reference makes this idempotent on their side).
        const full = await getWithdrawal(db, 'w.id = ?', w.id);
        const sent = full && (await sendTransfer(env, db, full));
        if (sent && !sent.ok && (await settleWithdrawal(db, w.id, 'failed', ['processing'], { failure_reason: sent.message }))) await emailWithdrawal(env, db, w.id);
      }
    } catch (e) {
      console.error('reconcile failed for withdrawal', w.id, e); // stays processing; retried next run
    }
    await db.run('UPDATE withdrawal_transactions SET updated_at = ? WHERE id = ?', now(), w.id);
  }
}

export async function scheduled(env: Env) {
  const db = new DB(env.DB);
  const ts = now();
  await releaseDueWithdrawals(env, db);
  if (env.PAYSTACK_SECRET_KEY) await reconcileProcessing(env, db);
  await db.batch([
    db.stmt('DELETE FROM auth_tokens WHERE expires_at < ?', ts),
    db.stmt('DELETE FROM idempotency_keys WHERE expires_at < ?', ts),
    db.stmt('DELETE FROM withdrawal_otps WHERE expires_at < ?', ts),
    db.stmt('DELETE FROM auth_sessions WHERE revoked_at IS NOT NULL AND revoked_at < ?', new Date(Date.now() - 30 * 86400_000).toISOString()),
  ]);
}
