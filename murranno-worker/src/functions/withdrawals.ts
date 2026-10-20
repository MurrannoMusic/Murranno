import type { Env } from '../env';
import { sha256Hex } from '../lib/crypto';
import { DB, encode, kobo, naira, now, uuid, type Row } from '../lib/db';
import { templates } from '../lib/email';
import { paystack, paystackReference } from '../lib/paystack';
import { fail, requireAdmin, requireUser, type FnCtx, type Handler } from './context';
import { checkPin } from './profile';
import { audit, emailUser, notify } from './shared';

const DAILY_LIMIT = 500_000;
const VELOCITY_MESSAGE = 'Daily withdrawal limit exceeded (Max ₦500k per 24 hours). Please contact support for higher limits.';
const TIER_2_THRESHOLD = 5_000; // 12h cooling-off
const TIER_3_THRESHOLD = 50_000; // manual admin review
const DELAY_HOURS = 12;
const fee = (amount: number) => (amount >= 5000 ? 50 : 25);

const WITHDRAWAL_SELECT = `SELECT w.*, CASE WHEN pm.id IS NULL THEN NULL ELSE json_object('type', pm.type,
  'account_name', pm.account_name, 'account_number', pm.account_number, 'bank_name', pm.bank_name) END AS payout_methods
  FROM withdrawal_transactions w LEFT JOIN payout_methods pm ON pm.id = w.payout_method_id`;

/** Withdrawals with their payout method embedded (the shape the apps read). */
export async function listWithdrawals(db: DB, whereAndOrder: string, ...params: unknown[]) {
  const rows = await db.all('withdrawal_transactions', `${WITHDRAWAL_SELECT} WHERE ${whereAndOrder}`, ...params);
  for (const r of rows) if (typeof r.payout_methods === 'string') r.payout_methods = JSON.parse(r.payout_methods);
  return rows;
}

export async function getWithdrawal(db: DB, where: string, ...params: unknown[]) {
  return (await listWithdrawals(db, `${where} LIMIT 1`, ...params))[0] ?? null;
}

/**
 * Insert a ledger row and move the money from available → pending in ONE transaction.
 * - hash chain: sha256(user_id|amount|net_amount|reference|previous_hash); the INSERT only happens
 *   if the user's latest hash is still the one we chained to (concurrent requests retry).
 * - the wallet UPDATE only runs if the INSERT did (changes() = 1), and the CHECK
 *   (available_balance >= 0) constraint rolls the whole batch back on overdraft.
 * - the 24h velocity limit is part of the INSERT's WHERE, so parallel requests can't each pass it.
 */
const VELOCITY_SQL = `(SELECT COALESCE(SUM(amount), 0) FROM withdrawal_transactions
  WHERE user_id = ? AND status NOT IN ('rejected', 'failed') AND created_at > ?)`;

async function insertLedgerRow(db: DB, userId: string, tx: Row): Promise<Row> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const since = new Date(Date.now() - 86400_000).toISOString();
    const prev =
      (await db.value<string>(
        'SELECT hash FROM withdrawal_transactions WHERE user_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 1',
        userId,
      )) ?? 'GENESIS';
    const hash = await sha256Hex(`${userId}|${tx.amount}|${tx.net_amount}|${tx.reference}|${prev}`);
    const id = uuid();
    const ts = now();
    const row = { ...tx, id, user_id: userId, previous_hash: prev, hash, created_at: ts, updated_at: ts, requested_at: ts };
    const cols = Object.keys(row);
    const kinds = await db.columns('withdrawal_transactions');
    const values = cols.map((c) => encode(kinds.get(c), row[c as keyof typeof row]));
    try {
      const [ins] = await db.batch([
        db.stmt(
          `INSERT INTO withdrawal_transactions (${cols.join(', ')})
           SELECT ${cols.map(() => '?').join(', ')}
           WHERE COALESCE((SELECT hash FROM withdrawal_transactions WHERE user_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 1), 'GENESIS') = ?
             AND ${VELOCITY_SQL} + ? <= ?`,
          ...values,
          userId,
          prev,
          userId,
          since,
          kobo(tx.amount),
          kobo(DAILY_LIMIT),
        ),
        db.stmt(
          `UPDATE wallet_balance SET available_balance = available_balance - ?, pending_balance = pending_balance + ?, updated_at = ?
           WHERE user_id = ? AND changes() = 1`,
          kobo(tx.amount),
          kobo(tx.amount),
          ts,
          userId,
        ),
      ]);
      if (ins.meta.changes === 1) return (await getWithdrawal(db, 'w.id = ?', id))!;
      // Not inserted: either the velocity limit or a concurrent ledger write (hash chain moved) — find out which.
      const spent = (await db.value<number>(`SELECT ${VELOCITY_SQL}`, userId, since)) ?? 0;
      if (spent + kobo(tx.amount) > kobo(DAILY_LIMIT)) throw fail(400, VELOCITY_MESSAGE);
    } catch (e: any) {
      if (/CHECK constraint failed/i.test(String(e?.message))) throw fail(400, 'Insufficient balance');
      throw e;
    }
  }
  throw fail(409, 'Another withdrawal is being processed. Please try again.');
}

type Settlement = 'completed' | 'failed' | 'rejected' | 'reversed';

/**
 * Move a withdrawal to a terminal state exactly once and settle the wallet:
 * completed → pending is released; failed/rejected → money returns to available;
 * reversed (after completion) → money returns to available.
 */
export async function settleWithdrawal(db: DB, id: string, outcome: Settlement, fromStatuses: string[], extra: Row = {}) {
  const tx = await getWithdrawal(db, 'w.id = ?', id);
  if (!tx || !fromStatuses.includes(tx.status)) return false;
  const ts = now();
  const patch = { ...extra, status: outcome, updated_at: ts, ...(outcome === 'completed' ? { completed_at: ts } : {}) };
  const update = await db.updateStmt('withdrawal_transactions', patch, `id = ? AND status IN (SELECT value FROM json_each(?))`, id, JSON.stringify(fromStatuses));
  const amount = kobo(tx.amount);
  const wallet =
    outcome === 'completed'
      ? db.stmt('UPDATE wallet_balance SET pending_balance = pending_balance - ?, updated_at = ? WHERE user_id = ? AND changes() = 1', amount, ts, tx.user_id)
      : tx.status === 'completed'
        ? db.stmt('UPDATE wallet_balance SET available_balance = available_balance + ?, updated_at = ? WHERE user_id = ? AND changes() = 1', amount, ts, tx.user_id)
        : db.stmt(
            'UPDATE wallet_balance SET available_balance = available_balance + ?, pending_balance = pending_balance - ?, updated_at = ? WHERE user_id = ? AND changes() = 1',
            amount,
            amount,
            ts,
            tx.user_id,
          );
  const [res] = await db.batch([update, wallet]);
  return (res.results as Row[]).length === 1;
}

/** Ask Paystack to pay out the net amount. Paystack dedupes on `reference`, so retries are safe. */
export async function sendTransfer(env: Env, db: DB, tx: Row) {
  const method = await db.first('payout_methods', 'SELECT recipient_code FROM payout_methods WHERE id = ?', tx.payout_method_id);
  if (!method?.recipient_code) return { ok: false as const, message: 'Payout method no longer exists' };
  const res = await paystack(env, '/transfer', {
    body: {
      source: 'balance',
      reason: tx.description || 'Withdrawal from wallet',
      amount: kobo(tx.net_amount),
      recipient: method.recipient_code,
      reference: tx.reference,
    },
  });
  if (!res.status) {
    // 5xx / 429 / unreadable: Paystack may still have queued the transfer — never refund on a guess.
    if (res.httpStatus === 0 || res.httpStatus >= 500 || res.httpStatus === 429) throw new Error(`Ambiguous Paystack response (${res.httpStatus})`);
    return { ok: false as const, message: res.message || 'Failed to initiate transfer' };
  }
  await db.update('withdrawal_transactions', { transfer_code: res.data?.transfer_code ?? null, paystack_response: res.data }, 'id = ?', tx.id);
  return { ok: true as const, data: res.data };
}

/** Claim a queued withdrawal (pending_delay / approved review) and transfer it; refund if Paystack refuses. */
export async function releaseWithdrawal(env: Env, db: DB, id: string, fromStatuses: string[], extra: Row = {}) {
  const claimed = await db.update(
    'withdrawal_transactions',
    { ...extra, status: 'processing' },
    'id = ? AND status IN (SELECT value FROM json_each(?))',
    id,
    JSON.stringify(fromStatuses),
  );
  if (!claimed.length) return { ok: false as const, message: 'Withdrawal is no longer awaiting release' };
  try {
    const result = await sendTransfer(env, db, claimed[0]);
    if (!result.ok && (await settleWithdrawal(db, id, 'failed', ['processing'], { failure_reason: result.message }))) {
      await emailWithdrawal(env, db, id);
    }
    return result;
  } catch (e) {
    // Outcome unknown (network): stay in `processing`; the transfer webhook settles it.
    console.error('transfer request failed', e);
    return { ok: true as const, data: null };
  }
}

const initiateWithdrawal: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const { payout_method_id, description, pin, idempotency_key } = ctx.body;
  const amount = Math.round(Number(ctx.body.amount) * 100) / 100;
  if (!pin) throw fail(400, 'Transaction PIN is required');
  if (!Number.isFinite(amount) || amount <= 0) throw fail(400, 'Invalid amount');

  const minimum = naira(await ctx.db.value<number>('SELECT minimum_payout_amount FROM platform_settings LIMIT 1')) || 0;
  if (amount < minimum) throw fail(400, `Minimum withdrawal amount is ₦${minimum.toLocaleString()}`);
  if (amount - fee(amount) <= 0) throw fail(400, 'Amount is too small to cover the transfer fee');

  if (idempotency_key) {
    const existing = await ctx.db.first('idempotency_keys', 'SELECT * FROM idempotency_keys WHERE idempotency_key = ? AND user_id = ?', idempotency_key, userId);
    if (existing?.status === 'completed') return { success: true, data: existing.response_body, cached: true };
    if (existing) throw fail(409, 'A withdrawal is already in progress for this request key.');
  }

  if (!(await checkPin(ctx, userId, pin))) throw fail(400, 'Incorrect transaction PIN');
  const profile = await ctx.db.first('profiles', 'SELECT payout_lock_until, kyc_status FROM profiles WHERE id = ?', userId);
  if (profile?.kyc_status !== 'verified') throw fail(403, 'Verify your identity before withdrawing earnings');
  if (profile?.payout_lock_until && Date.parse(profile.payout_lock_until) > Date.now()) {
    throw fail(400, `Security lock active until ${new Date(profile.payout_lock_until).toLocaleString()}. Payouts are restricted after changing bank details or your PIN.`);
  }

  const spent = naira(
    await ctx.db.value<number>(
      `SELECT COALESCE(SUM(amount), 0) FROM withdrawal_transactions
       WHERE user_id = ? AND status NOT IN ('rejected', 'failed') AND created_at > ?`,
      userId,
      new Date(Date.now() - 86400_000).toISOString(),
    ),
  );
  if (spent + amount > DAILY_LIMIT) {
    throw fail(400, VELOCITY_MESSAGE);
  }

  const method = await ctx.db.first('payout_methods', 'SELECT * FROM payout_methods WHERE id = ? AND user_id = ?', payout_method_id, userId);
  if (!method) throw fail(404, 'Payout method not found');
  const wallet = await ctx.db.first('wallet_balance', 'SELECT * FROM wallet_balance WHERE user_id = ?', userId);
  if (!wallet) throw fail(404, 'Wallet not found. Please contact support.');
  if (wallet.available_balance < amount) throw fail(400, 'Insufficient balance');

  // A request from a new device/IP while another payout is in flight goes to manual review.
  const last = await ctx.db.first(
    'withdrawal_transactions',
    "SELECT ip_address, user_agent FROM withdrawal_transactions WHERE user_id = ? AND status = 'processing' ORDER BY created_at DESC LIMIT 1",
    userId,
  );
  const userAgent = ctx.req.headers.get('user-agent') || 'unknown';
  const anomalous = Boolean(last && (last.ip_address !== ctx.ip || last.user_agent !== userAgent));
  const status = amount >= TIER_3_THRESHOLD || anomalous ? 'pending_review' : amount >= TIER_2_THRESHOLD ? 'pending_delay' : 'processing';

  if (idempotency_key) {
    try {
      await ctx.db.insert('idempotency_keys', {
        idempotency_key,
        user_id: userId,
        action: 'withdrawal',
        status: 'started',
        expires_at: new Date(Date.now() + 86400_000).toISOString(),
      });
    } catch {
      throw fail(409, 'A withdrawal is already in progress for this request key.');
    }
  }
  try {
    return await executeWithdrawal(ctx, userId, { amount, payout_method_id, description, status, userAgent, anomalous, idempotency_key });
  } catch (e) {
    if (idempotency_key) await ctx.db.run("DELETE FROM idempotency_keys WHERE idempotency_key = ? AND user_id = ? AND status = 'started'", idempotency_key, userId);
    throw e;
  }
};

async function executeWithdrawal(ctx: FnCtx, userId: string, w: Row) {
  const { amount, payout_method_id, description, status, userAgent, anomalous, idempotency_key } = w;
  let tx = await insertLedgerRow(ctx.db, userId, {
    payout_method_id,
    amount,
    fee: fee(amount),
    net_amount: amount - fee(amount),
    currency: 'NGN',
    status,
    reference: paystackReference('WD'),
    description: description || 'Withdrawal from wallet',
    scheduled_for: status === 'pending_delay' ? new Date(Date.now() + DELAY_HOURS * 3600_000).toISOString() : null,
    ip_address: ctx.ip,
    user_agent: userAgent,
  });

  if (status === 'processing') {
    let result;
    try {
      result = await sendTransfer(ctx.env, ctx.db, tx);
    } catch (e) {
      console.error('transfer request failed', e);
      result = { ok: true as const, data: null }; // unknown outcome: the webhook settles it
    }
    if (!result.ok) {
      await settleWithdrawal(ctx.db, tx.id, 'failed', ['processing'], { failure_reason: result.message });
      throw fail(400, result.message);
    }
    tx = (await getWithdrawal(ctx.db, 'w.id = ?', tx.id))!;
  }

  const tier = amount >= TIER_3_THRESHOLD ? 3 : amount >= TIER_2_THRESHOLD ? 2 : 1;
  await ctx.db.batch([
    await ctx.db.insertStmt('security_logs', {
      user_id: userId,
      event: 'withdrawal_requested',
      details: { amount, status, ip: ctx.ip, tier, anomalous },
      ip_address: ctx.ip,
      user_agent: userAgent,
    }),
    ctx.db.stmt('UPDATE payout_methods SET updated_at = ? WHERE id = ?', now(), payout_method_id),
    ...(idempotency_key
      ? [await ctx.db.updateStmt('idempotency_keys', { status: 'completed', response_body: tx }, 'idempotency_key = ? AND user_id = ?', idempotency_key, userId)]
      : []),
  ]);
  ctx.waitUntil(emailWithdrawal(ctx.env, ctx.db, tx.id));
  return { success: true, data: tx };
}

function withdrawalEmail(action: string, w: Row) {
  const amount = `${w.currency} ${Number(w.net_amount).toLocaleString()}`;
  const refunded = `${w.currency} ${Number(w.amount).toLocaleString()}`;
  const when = w.scheduled_for ? new Date(w.scheduled_for).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' }) : 'within 12 hours';
  const copy: Record<string, [string, string]> = {
    processing: ['Withdrawal Request Received', `We've received your withdrawal of ${amount} and sent it to your bank. It usually arrives within minutes. If you didn't make this request, change your PIN and contact support immediately.`],
    pending_delay: ['Withdrawal Request Received', `We've received your withdrawal of ${amount}. For your security it will be sent to your bank on ${when}. If you didn't make this request, contact support immediately so we can stop it.`],
    pending_review: ['Withdrawal Request Received', `We've received your withdrawal of ${amount}. It's being reviewed by our team and we'll email you when it's sent. If you didn't make this request, contact support immediately.`],
    completed: ['Your Withdrawal Has Been Paid', `${amount} has been sent to your bank account. Depending on your bank it can take a few minutes to show.`],
    failed: ['Your Withdrawal Failed', `Your withdrawal of ${amount} could not be completed${w.failure_reason ? ` (${w.failure_reason})` : ''}. ${refunded} is back in your wallet. Check your payout details and try again.`],
    reversed: ['Your Withdrawal Was Reversed', `Your bank returned the withdrawal of ${amount}. ${refunded} is back in your wallet. Check your payout details and try again.`],
    approve: ['Your Withdrawal Request Has Been Approved', `Your withdrawal request for ${amount} has been approved and is being processed. The funds should arrive in your account within 24-48 hours.`],
    reject: ['Your Withdrawal Request Has Been Rejected', `Your withdrawal request for ${amount} has been rejected and the funds are back in your wallet. ${w.failure_reason || 'Please contact support for more information.'}`],
    flag: ['Your Withdrawal Request Needs Review', `Your withdrawal request for ${amount} has been flagged for additional review. We'll update you shortly.`],
  };
  return copy[action];
}

/** Email the user about a withdrawal's current state (request receipt or final outcome). */
export async function emailWithdrawal(env: Env, db: DB, id: string, action?: string) {
  const w = await getWithdrawal(db, 'w.id = ?', id);
  const copy = w && withdrawalEmail(action ?? w.status, w);
  if (!copy) return;
  await emailUser(env, db, w.user_id, copy[0], (p) => templates.withdrawalStatus(p.full_name || 'there', copy[0], copy[1], w.reference, w.admin_notes), 'earnings_alerts');
  await notify(db, w.user_id, {title: copy[0], message: copy[1], related_type: 'earnings', related_id: id}, env);
}

const adminReviewWithdrawal: Handler = async (ctx) => {
  const admin = requireAdmin(ctx);
  const { action, withdrawal_id, admin_notes, failure_reason } = ctx.body;
  const withdrawal = await getWithdrawal(ctx.db, 'w.id = ?', withdrawal_id);
  if (!withdrawal) throw fail(404, 'Withdrawal not found');
  if (withdrawal.user_id === admin.userId && action !== 'add_note') throw fail(403, 'Another admin must review your own withdrawal');
  const review = { admin_notes: admin_notes ?? withdrawal.admin_notes, reviewed_by: admin.userId, reviewed_at: now() };
  const awaiting = ['pending_review', 'pending_delay', 'flagged'];

  switch (action) {
    case 'approve': {
      const result = await releaseWithdrawal(ctx.env, ctx.db, withdrawal_id, awaiting, review);
      if (!result.ok) throw fail(400, result.message);
      break;
    }
    case 'reject':
      if (!(await settleWithdrawal(ctx.db, withdrawal_id, 'rejected', awaiting, { ...review, failure_reason: failure_reason ?? null }))) {
        throw fail(400, `Cannot reject a withdrawal that is ${withdrawal.status}`);
      }
      break;
    case 'flag': {
      const updated = await ctx.db.update('withdrawal_transactions', { ...review, status: 'flagged' }, "id = ? AND status IN ('pending_review', 'pending_delay')", withdrawal_id);
      if (!updated.length) throw fail(400, `Cannot flag a withdrawal that is ${withdrawal.status}`);
      break;
    }
    case 'add_note':
      await ctx.db.update('withdrawal_transactions', { admin_notes }, 'id = ?', withdrawal_id);
      break;
    default:
      throw fail(400, 'Invalid action');
  }

  const result = await getWithdrawal(ctx.db, 'w.id = ?', withdrawal_id);
  await audit(ctx.db, admin.userId, `withdrawal_${action}`, 'withdrawal', withdrawal_id, { action, admin_notes, failure_reason });
  ctx.waitUntil(emailWithdrawal(ctx.env, ctx.db, withdrawal_id, action));
  return { success: true, data: result };
};

/** Cron: pay out withdrawals whose 12h cooling-off period has passed. */
export async function releaseDueWithdrawals(env: Env, db: DB) {
  const due = await db.all(
    'withdrawal_transactions',
    "SELECT id FROM withdrawal_transactions WHERE status = 'pending_delay' AND scheduled_for <= ? ORDER BY scheduled_for LIMIT 50",
    now(),
  );
  for (const w of due) await releaseWithdrawal(env, db, w.id, ['pending_delay']);
  return due.length;
}

export const withdrawalFunctions: Record<string, Handler> = {
  'paystack-initiate-withdrawal': initiateWithdrawal,
  'admin-review-withdrawal': adminReviewWithdrawal,
};
