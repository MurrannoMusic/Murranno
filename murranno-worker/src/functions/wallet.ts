import { now } from '../lib/db';
import { esc } from '../lib/http';
import { paystack } from '../lib/paystack';
import { fail, requireUser, type Handler } from './context';
import { artistOfUser, periodStart, profileOf } from './shared';
import { listWithdrawals } from './withdrawals';

const PAYOUT_LOCK_HOURS = 24;

const getWalletBalance: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const balance =
    (await ctx.db.first('wallet_balance', 'SELECT * FROM wallet_balance WHERE user_id = ?', userId)) ??
    (await ctx.db.upsert('wallet_balance', { user_id: userId }, ['user_id']));
  return { success: true, balance };
};

const getWalletTransactions: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const limit = Math.min(Math.max(parseInt(String(ctx.param('limit') ?? '50'), 10) || 50, 1), 200);
  const status = ctx.param('status');
  const transactions = await listWithdrawals(
    ctx.db,
    `w.user_id = ? ${status ? 'AND w.status = ?' : ''} ORDER BY w.created_at DESC LIMIT ?`,
    ...[userId, ...(status ? [status] : []), limit],
  );
  return { success: true, transactions };
};

const getEarningsBreakdown: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const period = ctx.param('period') ?? '30days';
  const artist = await artistOfUser(ctx.db, userId);
  if (!artist) return { success: true, earnings: [], period };
  const rows = await ctx.db.all(
    'earnings',
    "SELECT source, platform, amount FROM earnings WHERE artist_id = ? AND status = 'paid' AND period_start >= ?",
    artist.id,
    periodStart(period).toISOString(),
  );
  const groups = new Map<string, { source: string; platform: string; amount: number; count: number }>();
  for (const e of rows) {
    const key = `${e.source}-${e.platform || 'other'}`;
    const g = groups.get(key) ?? { source: e.source, platform: e.platform || 'other', amount: 0, count: 0 };
    g.amount += e.amount;
    g.count += 1;
    groups.set(key, g);
  }
  return { success: true, earnings: [...groups.values()], period };
};

const getPayoutMethods: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const payoutMethods = await ctx.db.all(
    'payout_methods',
    'SELECT * FROM payout_methods WHERE user_id = ? ORDER BY is_primary DESC, created_at DESC',
    userId,
  );
  return { success: true, payoutMethods };
};

const deletePayoutMethod: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const id = ctx.body.payoutMethodId;
  const method = await ctx.db.first('payout_methods', 'SELECT is_primary FROM payout_methods WHERE id = ? AND user_id = ?', id, userId);
  if (!method) throw fail(404, 'Payout method not found');
  const stmts = [ctx.db.stmt('DELETE FROM payout_methods WHERE id = ? AND user_id = ?', id, userId)];
  if (method.is_primary) {
    stmts.push(
      ctx.db.stmt(
        `UPDATE payout_methods SET is_primary = 1 WHERE id = (
           SELECT id FROM payout_methods WHERE user_id = ? AND id != ? ORDER BY created_at DESC LIMIT 1)`,
        userId,
        id,
      ),
    );
  }
  await ctx.db.batch(stmts);
  return { success: true };
};

const setPrimaryMethod: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const id = ctx.body.payoutMethodId;
  if (!(await ctx.db.value('SELECT 1 FROM payout_methods WHERE id = ? AND user_id = ?', id, userId))) {
    throw fail(404, 'Payout method not found');
  }
  await ctx.db.run('UPDATE payout_methods SET is_primary = (id = ?), updated_at = ? WHERE user_id = ?', id, now(), userId);
  return { success: true };
};

const getBanks: Handler = async (ctx) => {
  requireUser(ctx);
  const res = await paystack(ctx.env, '/bank?currency=NGN');
  if (!res.status) throw fail(400, res.message || 'Failed to fetch banks', { success: false });
  return { success: true, data: res.data };
};

const resolveAccount: Handler = async (ctx) => {
  requireUser(ctx);
  const { account_number, bank_code } = ctx.body;
  if (!/^\d{10}$/.test(String(account_number ?? '')) || !/^\w+$/.test(String(bank_code ?? ''))) {
    throw fail(400, 'Account number and bank code are required', { success: false });
  }
  const res = await paystack(ctx.env, `/bank/resolve?account_number=${account_number}&bank_code=${encodeURIComponent(bank_code)}`);
  if (!res.status) throw fail(400, res.message || 'Failed to resolve account', { success: false });
  return { success: true, data: res.data };
};

const createRecipient: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const { account_name, account_number, bank_code, bank_name } = ctx.body;
  if (!account_name || !/^\d{10}$/.test(String(account_number ?? '')) || !bank_code || !bank_name) {
    throw fail(400, 'Account name, 10-digit account number, bank code and bank name are required', { success: false });
  }
  const verified = await paystack(ctx.env, `/bank/resolve?account_number=${account_number}&bank_code=${encodeURIComponent(bank_code)}`);
  if (!verified.status || !verified.data?.account_name) throw fail(400, verified.message || 'Bank account verification failed');
  const verifiedName = verified.data.account_name;
  const res = await paystack(ctx.env, '/transferrecipient', {
    body: { type: 'nuban', name: verifiedName, account_number, bank_code, currency: 'NGN' },
  });
  if (!res.status) throw fail(400, res.message || 'Failed to create recipient', { success: false });

  const isFirst = !(await ctx.db.value('SELECT 1 FROM payout_methods WHERE user_id = ?', userId));
  const payoutMethod = await ctx.db.insert('payout_methods', {
    user_id: userId,
    type: 'bank',
    recipient_code: res.data.recipient_code,
    bank_code,
    bank_name,
    account_number,
    account_name: res.data?.details?.account_name || verifiedName,
    currency: 'NGN',
    is_verified: true,
    is_primary: isFirst,
    metadata: res.data,
  });
  // New bank details freeze payouts for 24h (enforced server-side; the app shows the notice).
  const lock = new Date(Date.now() + PAYOUT_LOCK_HOURS * 3600_000).toISOString();
  await ctx.db.run(
    'UPDATE profiles SET payout_lock_until = MAX(COALESCE(payout_lock_until, ?), ?), updated_at = ? WHERE id = ?',
    lock,
    lock,
    now(),
    userId,
  );
  return { success: true, data: payoutMethod };
};

const generateReceipt: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const tx = await ctx.db.first('withdrawal_transactions', 'SELECT * FROM withdrawal_transactions WHERE id = ? AND user_id = ?', ctx.body.transactionId, userId);
  if (!tx) throw fail(404, 'Transaction not found');
  const profile = await profileOf(ctx.db, userId);
  const method = tx.payout_method_id
    ? await ctx.db.first('payout_methods', 'SELECT bank_name, account_number, account_name FROM payout_methods WHERE id = ?', tx.payout_method_id)
    : null;
  const dateOpts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
  const requested = new Date(tx.requested_at || tx.created_at).toLocaleDateString('en-GB', dateOpts);
  const completed = tx.completed_at ? new Date(tx.completed_at).toLocaleDateString('en-GB', { ...dateOpts, hour: '2-digit', minute: '2-digit' }) : 'Pending';
  const money = (v: number) => `${esc(tx.currency)} ${Number(v).toFixed(2)}`;
  const item = (label: string, value: unknown, wide = false) =>
    `<div class="info-item"${wide ? ' style="grid-column:1/-1"' : ''}><div class="info-label">${label}</div><div class="info-value">${esc(value)}</div></div>`;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt - ${esc(tx.reference)}</title>
<style>
body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px}
.header{text-align:center;margin-bottom:40px;border-bottom:3px solid #333;padding-bottom:20px}.header h1{margin:0;color:#333;font-size:32px}
.receipt-info{background:#f5f5f5;padding:20px;border-radius:8px;margin-bottom:30px}.receipt-info h2{margin-top:0;color:#333;font-size:20px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-top:15px}.info-label{font-weight:bold;color:#666;font-size:12px;text-transform:uppercase;margin-bottom:5px}
.info-value{color:#333;font-size:16px}.amount{text-align:center;padding:30px;background:#e8f5e9;border-radius:8px;margin:30px 0;font-size:48px;font-weight:bold;color:#2e7d32}
.row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee}.row.total{border-top:2px solid #333;border-bottom:none;font-weight:bold;font-size:18px}
.footer{text-align:center;margin-top:50px;padding-top:20px;border-top:1px solid #ddd;color:#999;font-size:12px}
</style></head><body>
<div class="header"><h1>Murranno Music</h1><p>Official Transaction Receipt</p></div>
<div class="receipt-info"><h2>Receipt Details</h2><div class="info-grid">
${item('Receipt Number', tx.reference)}${item('Transaction ID', tx.id)}${item('Date Issued', requested)}${item('Status', String(tx.status).toUpperCase())}
${item('Account Holder', profile?.full_name || 'N/A')}${item('Email', profile?.email || 'N/A')}</div></div>
${method ? `<div class="receipt-info"><h2>Payout Destination</h2><div class="info-grid">${item('Bank Name', method.bank_name)}${item('Account Number', method.account_number)}${item('Account Name', method.account_name, true)}</div></div>` : ''}
<div class="amount">${money(tx.amount)}</div>
<div class="row"><span>Withdrawal Amount</span><span>${money(tx.amount)}</span></div>
${tx.fee ? `<div class="row"><span>Processing Fee</span><span>-${money(tx.fee)}</span></div>` : ''}
<div class="row total"><span>Net Amount</span><span>${money(tx.net_amount)}</span></div>
${tx.description ? `<div class="receipt-info" style="margin-top:30px"><h2>Description</h2><p>${esc(tx.description)}</p></div>` : ''}
<div class="receipt-info" style="margin-top:30px"><h2>Transaction Timeline</h2><div class="info-grid">${item('Requested At', requested)}${item('Completed At', completed)}</div></div>
<div class="footer"><p><strong>Murranno Music</strong></p><p>This is an official receipt for your transaction.</p>
<p>Generated on ${esc(new Date().toLocaleDateString('en-GB', { ...dateOpts, hour: '2-digit', minute: '2-digit' }))}</p></div>
</body></html>`;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html', 'Content-Disposition': `attachment; filename="receipt-${tx.reference}.html"` },
  });
};

export const walletFunctions: Record<string, Handler> = {
  'get-wallet-balance': getWalletBalance,
  'get-wallet-transactions': getWalletTransactions,
  'get-earnings-breakdown': getEarningsBreakdown,
  'get-payout-methods': getPayoutMethods,
  'delete-payout-method': deletePayoutMethod,
  'paystack-set-primary-method': setPrimaryMethod,
  'paystack-get-banks': getBanks,
  'paystack-resolve-account': resolveAccount,
  'paystack-create-recipient': createRecipient,
  'generate-receipt': generateReceipt,
};
