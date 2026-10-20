// End-to-end check against a local `wrangler dev` using the same supabase-js client the apps use.
//   npm run dev  (in another terminal, output saved to a file), then:
//   WRANGLER_LOG=<that file> npm run smoke
// Dev emails are printed to the wrangler log; codes/links are read from there.
import { createClient } from '@supabase/supabase-js';
import { readdirSync, readFileSync } from 'node:fs';
import { createHmac } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const API = process.env.API_URL ?? 'http://127.0.0.1:8787';
const LOG = process.env.WRANGLER_LOG;
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? 'sk_test_local_dummy_key';
if (!LOG) throw new Error('Set WRANGLER_LOG to the wrangler dev output file');

const dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
const sqlite = new DatabaseSync(`${dir}/${readdirSync(dir).find((f) => f.endsWith('.sqlite'))}`);
const q = (s, ...p) => sqlite.prepare(s).all(...p);
const run = (s, ...p) => sqlite.prepare(s).run(...p);

let failures = 0;
const check = (cond, msg, extra) => {
  if (cond) console.log(`  ok    ${msg}`);
  else {
    failures++;
    console.error(`  FAIL  ${msg}`, extra ?? '');
  }
};
const section = (s) => console.log(`\n# ${s}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function lastEmail(to, after) {
  for (let i = 0; i < 50; i++) {
    const lines = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[email] to=${to} `));
    if (lines.length > after) return lines[lines.length - 1];
    await sleep(200);
  }
  throw new Error(`no email for ${to}`);
}
const emailCount = (to) => readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[email] to=${to} `)).length;

const client = () =>
  createClient(API, 'public', { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });

async function signUpConfirmed(email, password) {
  const sb = client();
  const before = emailCount(email);
  const { data, error } = await sb.auth.signUp({ email, password, options: { data: { first_name: 'Test', last_name: email.split('@')[0] } } });
  if (error) throw error;
  const mail = await lastEmail(email, before);
  const code = /Enter this code in the app to verify your email: (\d{6})/.exec(mail)?.[1];
  const v = await sb.auth.verifyOtp({ email, token: code, type: 'signup' });
  if (v.error) throw v.error;
  return { sb, user: data.user, session: v.data.session };
}

const stamp = Date.now();
const emailA = `artist${stamp}@example.com`;
const emailB = `other${stamp}@example.com`;
const emailAdmin = `admin${stamp}@example.com`;

section('auth: signup → OTP → session');
const anon = client();
const signup = await anon.auth.signUp({ email: emailA, password: 'secret123', options: { data: { first_name: 'Ada', last_name: 'Obi', phone_number: '0800' } } });
check(!signup.error && signup.data.user?.email === emailA && !signup.data.session, 'signUp returns user without session', signup.error);
const dup = await anon.auth.signInWithPassword({ email: emailA, password: 'secret123' });
check(dup.error?.message === 'Email not confirmed', 'login before confirmation is refused', dup.error?.message);
const mailA = await lastEmail(emailA, 0);
const codeA = /verify your email: (\d{6})/.exec(mailA)?.[1];
const wrong = await anon.auth.verifyOtp({ email: emailA, token: codeA === '000000' ? '111111' : '000000', type: 'signup' });
check(Boolean(wrong.error), 'wrong OTP is rejected');
const sbA = client();
const verified = await sbA.auth.verifyOtp({ email: emailA, token: codeA, type: 'signup' });
check(!verified.error && verified.data.session?.access_token, 'verifyOtp with the emailed code returns a session', verified.error);
const uidA = verified.data.user.id;
const prov = q('SELECT (SELECT COUNT(*) FROM profiles WHERE id = ?) p, (SELECT tier FROM user_roles WHERE user_id = ?) t, (SELECT COUNT(*) FROM wallet_balance WHERE user_id = ?) w, (SELECT status FROM subscriptions WHERE user_id = ?) s', uidA, uidA, uidA, uidA)[0];
check(prov.p === 1 && prov.t === 'artist' && prov.w === 1 && prov.s === 'trial', 'new user provisioned (profile, artist role, wallet, 14-day trial)', prov);
const dupSignup = await anon.auth.signUp({ email: emailA, password: 'secret123' });
check(dupSignup.error?.message === 'User already registered', 'duplicate signup refused', dupSignup.error?.message);

const login = await client().auth.signInWithPassword({ email: emailA, password: 'secret123' });
check(!login.error && login.data.session, 'password login works', login.error);
const badLogin = await client().auth.signInWithPassword({ email: emailA, password: 'nope-nope' });
check(badLogin.error?.message === 'Invalid login credentials', 'bad password refused');
const me = await sbA.auth.getUser();
check(me.data.user?.id === uidA && me.data.user.user_metadata.first_name === 'Ada', 'getUser returns the user + metadata', me.error);

section('auth: refresh rotation + logout');
const sbR = client();
await sbR.auth.setSession(login.data.session);
const r1 = await sbR.auth.refreshSession();
check(!r1.error && r1.data.session.refresh_token !== login.data.session.refresh_token, 'refresh rotates the refresh token', r1.error);
await sleep(10_500);
const replay = await fetch(`${API}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', body: JSON.stringify({ refresh_token: login.data.session.refresh_token }), headers: { 'Content-Type': 'application/json' } });
check(replay.status === 400, 'replaying an old refresh token after the grace window is refused');
const afterReplay = await fetch(`${API}/auth/v1/user`, { headers: { Authorization: `Bearer ${r1.data.session.access_token}` } });
check(afterReplay.status === 401, 'refresh-token reuse revokes the whole session');

section('auth: recovery link → session in URL hash → password update');
const recBefore = emailCount(emailA);
const rec = await anon.auth.resetPasswordForEmail(emailA, { redirectTo: 'http://localhost:8080/reset-password' });
check(!rec.error, 'resetPasswordForEmail accepted');
const recMail = await lastEmail(emailA, recBefore);
const link = /links=(\S+)/.exec(recMail)?.[1];
const hop = await fetch(link, { redirect: 'manual' });
const location = hop.headers.get('location') ?? '';
check(hop.status === 303 && location.startsWith('http://localhost:8080/reset-password#access_token='), 'recovery link redirects to the app with a session', location.slice(0, 80));
const hash = new URLSearchParams(location.split('#')[1]);
const sbRec = client();
await sbRec.auth.setSession({ access_token: hash.get('access_token'), refresh_token: hash.get('refresh_token') });
const upd = await sbRec.auth.updateUser({ password: 'newsecret456' });
check(!upd.error, 'updateUser({ password }) from the recovery session', upd.error);
const relog = await client().auth.signInWithPassword({ email: emailA, password: 'newsecret456' });
check(!relog.error, 'new password works');
const oldSession = await sbA.auth.getUser();
check(Boolean(oldSession.error), 'password change signed out other sessions');
const evil = await fetch(`${API}/auth/v1/recover?redirect_to=${encodeURIComponent('https://evil.example/steal')}`, { method: 'POST', body: JSON.stringify({ email: emailA }), headers: { 'Content-Type': 'application/json' } });
const evilMail = await lastEmail(emailA, recBefore + 1);
check(evil.ok && !evilMail.includes('evil.example'), 'redirect_to outside the allow-list is replaced with APP_URL');

// Fresh signed-in client for the rest
const A = client();
await A.auth.setSession(relog.data.session);

section('rest: profiles / masking / column rules');
const prof = await A.from('profiles').select('*').eq('id', uidA).single();
check(!prof.error && prof.data.email === emailA && prof.data.first_name === 'Ada' && prof.data.banned === false, 'own profile readable, booleans decoded', prof.error ?? prof.data);
const kycOk = await A.from('profiles').update({ nin_number: '12345678901', kyc_status: 'pending', kyc_tier: 1 }).eq('id', uidA).select().single();
check(!kycOk.error && kycOk.data.kyc_status === 'pending', 'user can submit KYC (pending)', kycOk.error);
const kycBad = await A.from('profiles').update({ kyc_status: 'verified' }).eq('id', uidA);
check(kycBad.error?.code === '42501', 'user cannot self-approve KYC', kycBad.error);
const lockBad = await A.from('profiles').update({ payout_lock_until: null }).eq('id', uidA);
check(lockBad.error?.code === '42501', 'user cannot clear their payout lock', lockBad.error);
const role = await A.from('user_roles').select('*').eq('user_id', uidA).single();
check(role.data?.tier === 'artist', 'user_roles readable');
const anonProfiles = await anon.from('profiles').select('*');
check(!anonProfiles.error && anonProfiles.data.length === 0, 'anonymous users see no profiles');

section('functions: profile + PIN');
const gp = await A.functions.invoke('get-profile');
check(gp.data?.success && gp.data.profile.tier === 'artist' && gp.data.profile.transaction_pin_hash === null, 'get-profile (no PIN yet)', gp.error);
const setPin = await A.functions.invoke('setup-transaction-pin', { body: { pin: '4821' } });
check(setPin.data?.success, 'setup-transaction-pin', setPin.error);
const gp2 = await A.functions.invoke('get-profile');
check(gp2.data.profile.transaction_pin_hash === true, 'PIN hash is masked (true), never returned');
const restMask = await A.from('profiles').select('transaction_pin_hash').eq('id', uidA).single();
check(restMask.data?.transaction_pin_hash === true, 'REST also masks the PIN hash');
const vp = await A.functions.invoke('verify-transaction-pin', { body: { pin: '4821' } });
check(vp.data?.success === true, 'correct PIN verifies');
for (let i = 0; i < 5; i++) await A.functions.invoke('verify-transaction-pin', { body: { pin: '0000' } });
const locked = await A.functions.invoke('verify-transaction-pin', { body: { pin: '4821' } });
check(locked.error && (await locked.error.context.json()).error.includes('Too many incorrect PIN attempts'), '5 wrong PINs lock the PIN');
run('UPDATE profiles SET pin_locked_until = NULL, pin_failed_attempts = 0 WHERE id = ?', uidA);

section('functions: artist + upload + releases');
const ua = await A.functions.invoke('update-artist-profile', { body: { stage_name: 'Ada Beats', bio: 'hi', user_id: 'hijack' } });
check(ua.data?.success && ua.data.artist.stage_name === 'Ada Beats' && ua.data.artist.user_id === uidA, 'update-artist-profile creates artist, ignores user_id', ua.error);
const dupArtist = await A.from('artists').insert({ stage_name: 'Dup' });
check(dupArtist.error?.code === '23505', 'second artist profile via REST refused', dupArtist.error);
const unverifiedUp = await A.functions.invoke('upload-track', { body: { releaseData: { title: 'T', type: 'Single', releaseDate: '2026-12-01' }, tracks: [{ title: 'x', duration: 180 }] } });
check(unverifiedUp.error?.context?.status === 403, 'music submission requires verified KYC');
run("UPDATE profiles SET kyc_status = 'verified' WHERE id = ?", uidA); // fixture: admin approval is tested later
const up = await A.functions.invoke('upload-track', {
  body: {
    releaseData: { title: 'First Single', type: 'Single', releaseDate: '2026-11-01', genre: 'Afrobeats', distribution_platforms: ['spotify', 'apple'] },
    tracks: [{ title: 'Track One', duration: 180, songwriter_legal_names: ['Ada Obi'] }],
    coverArtFile: { url: 'https://img/x.jpg' },
    audioFiles: [{ url: 'https://audio/x.mp3' }],
  },
});
check(up.data?.success && up.data.release.distribution_platforms?.[1] === 'apple' && up.data.tracks[0].songwriter_legal_names[0] === 'Ada Obi', 'upload-track stores release + tracks (arrays round-trip)', up.error ? await up.error.context.json() : up.data);
const releaseId = up.data.release.id;
const trackId = up.data.tracks[0].id;
const artistId = up.data.release.artist_id;
run("INSERT INTO streaming_data (id, track_id, date, platform, streams, country) VALUES (?, ?, date('now','-2 day'), 'Spotify', 120, 'NG'), (?, ?, date('now','-1 day'), 'Apple', 30, 'GH')", crypto.randomUUID(), trackId, crypto.randomUUID(), trackId);
run("INSERT INTO earnings (id, artist_id, release_id, amount, source, platform, status, period_start, period_end) VALUES (?, ?, ?, 152550, 'streaming', 'Spotify', 'paid', ?, ?)", crypto.randomUUID(), artistId, releaseId, new Date(Date.now() - 5 * 86400e3).toISOString(), new Date().toISOString());

const ur = await A.functions.invoke('get-user-releases', { body: { status: 'All' } });
check(ur.data?.releases?.[0]?.title === 'First Single' && ur.data.releases[0].tracks.length === 1, 'get-user-releases', ur.error);
const rd = await A.functions.invoke('get-release-detail', { body: { releaseId } });
check(rd.data?.release?.total_streams === 150 && rd.data.release.total_earnings === 1525.5, 'get-release-detail totals (streams + kobo→naira)', rd.data?.release);
const an = await A.functions.invoke('get-analytics-data', { body: { period: 30 } });
check(an.data?.totalStreams === 150 && an.data.bestPlatform?.name === 'Spotify' && an.data.totalEarnings === 1525.5, 'get-analytics-data honours body params', an.data);
const eb = await A.functions.invoke('get-earnings-breakdown', { body: { period: 30 } });
check(eb.data?.earnings?.[0]?.amount === 1525.5, 'get-earnings-breakdown', eb.data);

section('rest: embeds + !inner + cross-user isolation');
const topTracks = await A.from('tracks').select('id, title, release_id, releases!inner(artist_id), streaming_data(streams)').eq('releases.artist_id', artistId);
check(!topTracks.error && topTracks.data[0]?.streaming_data.length === 2 && topTracks.data[0].releases.artist_id === artistId, 'tracks with !inner many-to-one + one-to-many embeds', topTracks.error ?? topTracks.data);
const nested = await A.from('streaming_data').select('date, streams, tracks!inner(release_id, releases!inner(artist_id))').eq('tracks.releases.artist_id', artistId).order('date', { ascending: true });
check(!nested.error && nested.data.length === 2 && nested.data[0].streams === 120, 'two-level !inner filter (useAnalytics shape)', nested.error ?? nested.data);
const earningsEmbed = await A.from('earnings').select('amount, source, platform, release_id, releases(title)').eq('artist_id', artistId);
check(earningsEmbed.data?.[0]?.releases?.title === 'First Single' && earningsEmbed.data[0].amount === 1525.5, 'earnings → releases embed', earningsEmbed.data);
const counted = await A.from('releases').select('*', { count: 'exact', head: true }).eq('artist_id', artistId);
check(counted.count === 1, 'count=exact head request', counted);
const maybe = await A.from('releases').select('id').eq('id', 'does-not-exist').maybeSingle();
check(!maybe.error && maybe.data === null, 'maybeSingle with no rows → null');
const single = await A.from('releases').select('id').eq('id', 'does-not-exist').single();
check(single.error?.code === 'PGRST116', 'single with no rows → PGRST116');
const inQuery = await A.from('tracks').select('id').in('id', [trackId, 'x']);
check(inQuery.data?.length === 1, 'in() filter');
const ilike = await A.from('releases').select('title').ilike('title', '%single%');
check(ilike.data?.length === 1, 'ilike filter');

const B = (await signUpConfirmed(emailB, 'secret123')).sb;
const bReleases = await B.from('releases').select('*');
check(!bReleases.error && bReleases.data.length === 0, "another user cannot read A's releases");
const bDelete = await B.from('releases').delete().eq('id', releaseId);
check(bDelete.error?.code === '42501', "another user cannot delete A's release", bDelete.error);
const bDetail = await B.functions.invoke('get-release-detail', { body: { releaseId } });
check(bDetail.error?.context?.status === 403, "get-release-detail denies other users");
const bArtist = await B.from('artists').update({ stage_name: 'pwned' }).eq('id', artistId).select();
check(!bArtist.error && bArtist.data.length === 0, "another user's artist update matches no rows");

section('wallet + withdrawals (ledger, holds, refunds)');
run('UPDATE wallet_balance SET available_balance = 2000000 WHERE user_id = ?', uidA); // ₦20,000
const pmId = crypto.randomUUID();
run("INSERT INTO payout_methods (id, user_id, recipient_code, bank_code, bank_name, account_number, account_name, is_primary) VALUES (?, ?, 'RCP_test', '058', 'GTBank', '0123456789', 'ADA OBI', 1)", pmId, uidA);
const wb = await A.functions.invoke('get-wallet-balance');
check(wb.data?.balance?.available_balance === 20000, 'get-wallet-balance in naira', wb.data);
const noPin = await A.functions.invoke('paystack-initiate-withdrawal', { body: { payout_method_id: pmId, amount: 6000, pin: '9999' } });
check(noPin.error && (await noPin.error.context.json()).error === 'Incorrect transaction PIN', 'wrong PIN blocks withdrawal');
const tooMuch = await A.functions.invoke('paystack-initiate-withdrawal', { body: { payout_method_id: pmId, amount: 25000, pin: '4821' } });
check(tooMuch.error && (await tooMuch.error.context.json()).error === 'Insufficient balance', 'cannot withdraw more than available');
const w1 = await A.functions.invoke('paystack-initiate-withdrawal', { body: { payout_method_id: pmId, amount: 6000, pin: '4821', idempotency_key: `k-${stamp}` } });
check(w1.data?.success && w1.data.data.status === 'pending_delay' && w1.data.data.fee === 50 && w1.data.data.net_amount === 5950, 'tier-2 withdrawal queued for 12h cooling-off', w1.error ?? w1.data);
const w1again = await A.functions.invoke('paystack-initiate-withdrawal', { body: { payout_method_id: pmId, amount: 6000, pin: '4821', idempotency_key: `k-${stamp}` } });
check(w1again.data?.cached === true && w1again.data.data.id === w1.data.data.id, 'same idempotency key returns the original withdrawal');
let bal = q('SELECT available_balance a, pending_balance p FROM wallet_balance WHERE user_id = ?', uidA)[0];
check(bal.a === 1400000 && bal.p === 600000, 'funds moved available → pending (kobo)', bal);

// two concurrent requests that together exceed the balance: exactly one may succeed
const [c1, c2] = await Promise.all([
  A.functions.invoke('paystack-initiate-withdrawal', { body: { payout_method_id: pmId, amount: 9000, pin: '4821' } }),
  A.functions.invoke('paystack-initiate-withdrawal', { body: { payout_method_id: pmId, amount: 9000, pin: '4821' } }),
]);
const okCount = [c1, c2].filter((r) => r.data?.success).length;
bal = q('SELECT available_balance a, pending_balance p FROM wallet_balance WHERE user_id = ?', uidA)[0];
check(okCount === 1 && bal.a === 500000 && bal.p === 1500000, 'concurrent overdraft attempt: one succeeds, balance never negative', { okCount, bal });
const chain = q('SELECT hash, previous_hash FROM withdrawal_transactions WHERE user_id = ? ORDER BY created_at', uidA);
check(chain.length === 2 && chain[0].previous_hash === 'GENESIS' && chain[1].previous_hash === chain[0].hash, 'hash chain links consecutive withdrawals', chain);
let tamper = null;
try { run('UPDATE withdrawal_transactions SET amount = 1 WHERE user_id = ?', uidA); } catch (e) { tamper = e.message; }
check(tamper?.includes('append-only'), 'ledger money fields are immutable (trigger)', tamper);
const txs = await A.functions.invoke('get-wallet-transactions', { body: { limit: 10 } });
check(txs.data?.transactions?.length === 2 && txs.data.transactions[0].payout_methods?.bank_name === 'GTBank', 'get-wallet-transactions embeds payout method', txs.data);

section('admin: review, refunds, guards');
const adm = await signUpConfirmed(emailAdmin, 'secret123');
const notAdmin = await adm.sb.functions.invoke('admin-get-all-users');
check(notAdmin.error?.context?.status === 403, 'non-admin blocked from admin functions');
run("UPDATE user_roles SET tier = 'admin' WHERE user_id = ?", adm.user.id);
const users = await adm.sb.functions.invoke('admin-get-all-users', { body: { search: emailA } });
check(users.data?.users?.length === 1 && users.data.total === 1 && users.data.users[0].user_roles[0].tier === 'artist', 'admin-get-all-users search + total', users.data);
const pendingId = w1.data.data.id;
const reject = await adm.sb.functions.invoke('admin-review-withdrawal', { body: { action: 'reject', withdrawal_id: pendingId, failure_reason: 'test' } });
check(reject.data?.success && reject.data.data.status === 'rejected', 'admin rejects withdrawal', reject.error);
bal = q('SELECT available_balance a, pending_balance p FROM wallet_balance WHERE user_id = ?', uidA)[0];
check(bal.a === 1100000 && bal.p === 900000, 'rejection refunds the FULL amount (not net)', bal);
const rejectAgain = await adm.sb.functions.invoke('admin-review-withdrawal', { body: { action: 'reject', withdrawal_id: pendingId } });
check(rejectAgain.error?.context?.status === 400, 'cannot reject twice (no double refund)');
const kycApprove = await adm.sb.from('profiles').update({ kyc_status: 'verified', kyc_tier: 2 }).eq('id', uidA).select().single();
check(kycApprove.data?.kyc_status === 'verified', 'admin can approve KYC via REST', kycApprove.error);
const ann = await adm.sb.from('system_announcements').insert({ title: 'Hello', message: 'World', type: 'info' }).select().single();
check(!ann.error && ann.data.is_active === true, 'admin creates announcement', ann.error);
const annAnon = await anon.from('system_announcements').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(1).maybeSingle();
check(annAnon.data?.title === 'Hello', 'announcements readable anonymously');
const annUser = await B.from('system_announcements').insert({ title: 'x', message: 'y' });
check(annUser.error?.code === '42501', 'non-admin cannot create announcements', annUser.error);
const settings = await adm.sb.functions.invoke('update-platform-settings', { body: { settings: { platformName: 'Murranno', minimumPayout: 1500, maintenanceMode: true, usdToNgnRate: 1650 } } });
check(settings.data?.settings?.minimum_payout_amount === 1500 && settings.data.settings.maintenance_mode === true, 'update-platform-settings maps all fields', settings.data);
const minPayout = await A.functions.invoke('paystack-initiate-withdrawal', { body: { payout_method_id: pmId, amount: 1000, pin: '4821' } });
check(minPayout.error && (await minPayout.error.context.json()).error.startsWith('Minimum withdrawal'), 'minimum payout setting enforced');
const team = await adm.sb.functions.invoke('admin-manage-team', { body: { action: 'remove', userId: adm.user.id } });
check(team.error?.context?.status === 400, 'admin cannot remove themselves');

section('paystack webhook');
const fakeSig = await fetch(`${API}/webhooks/paystack`, { method: 'POST', body: '{"event":"charge.success","data":{}}', headers: { 'x-paystack-signature': 'deadbeef' } });
check(fakeSig.status === 401, 'unsigned/forged webhook rejected');
const noSig = await fetch(`${API}/webhooks/paystack`, { method: 'POST', body: '{"event":"charge.success","data":{}}' });
check(noSig.status === 401, 'webhook without signature rejected');
const processing = q("SELECT id, reference FROM withdrawal_transactions WHERE user_id = ? AND status = 'pending_delay'", uidA)[0];
run("UPDATE withdrawal_transactions SET status = 'processing' WHERE id = ?", processing.id);
const body = JSON.stringify({ event: 'transfer.success', data: { reference: processing.reference, transfer_code: 'TRF_1', status: 'success' } });
const signed = await fetch(`${API}/webhooks/paystack`, { method: 'POST', body, headers: { 'x-paystack-signature': createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex') } });
const settled = q('SELECT status FROM withdrawal_transactions WHERE id = ?', processing.id)[0];
bal = q('SELECT available_balance a, pending_balance p FROM wallet_balance WHERE user_id = ?', uidA)[0];
check(signed.status === 200 && settled.status === 'completed' && bal.p === 0 && bal.a === 1100000, 'signed transfer.success completes payout and releases the hold', { settled, bal });
const replayWebhook = await fetch(`${API}/webhooks/paystack`, { method: 'POST', body, headers: { 'x-paystack-signature': createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex') } });
bal = q('SELECT pending_balance p FROM wallet_balance WHERE user_id = ?', uidA)[0];
check(replayWebhook.status === 200 && bal.p === 0, 'webhook replay is a no-op');

section('campaigns + subscriptions guards');
run("INSERT OR IGNORE INTO promotion_services (id, name, category, price) VALUES ('svc1', 'Spotify Playlist', 'Streaming', 50000)");
const camp = await A.functions.invoke('create-campaign', { body: { name: 'Launch', type: 'service', platform: 'Multi', budget: 50000, start_date: '2026-11-01', release_id: releaseId, status: 'Active', campaign_brief: 'brief!' } });
check(camp.data?.campaign?.status === 'Draft' && camp.data.campaign.campaign_brief === 'brief!' && camp.data.campaign.artist_id === artistId, 'create-campaign clamps status, keeps brief, infers artist', camp.data);
const link1 = await A.from('campaign_services').insert([{ campaign_id: camp.data.campaign.id, service_id: 'svc1', status: 'completed' }]).select();
check(!link1.error && link1.data[0].status === 'pending', 'owner links services (status forced to pending)', link1.error);
const linkB = await B.from('campaign_services').insert({ campaign_id: camp.data.campaign.id, service_id: 'svc1' });
check(linkB.error?.code === '42501', "other users cannot attach services to someone else's campaign", linkB.error);
const bCamp = await B.functions.invoke('create-campaign', { body: { name: 'x', type: 'x', platform: 'x', start_date: '2026-11-01', release_id: releaseId } });
check(bCamp.error?.context?.status === 403, "cannot create a campaign for another artist's release");
const paidUpdate = await A.from('campaigns').update({ payment_status: 'paid' }).eq('id', camp.data.campaign.id);
check(paidUpdate.error?.code === '42501', 'owner cannot mark own campaign paid via REST', paidUpdate.error);
const subTier = await A.functions.invoke('update-subscription-tier', { body: { tier: 'label' } });
check(subTier.error?.context?.status === 404, 'free tier-upgrade function no longer exists');
const promote = await A.functions.invoke('admin-promote-user', { body: { email: emailA } });
check(promote.error?.context?.status === 404, 'self-promote-to-admin function no longer exists');
const invite = await A.functions.invoke('invite-artist-to-label', { body: { artistEmail: emailB } });
check(invite.error?.context?.status === 403, 'only label tier/subscribers can invite artists');
run("INSERT INTO subscriptions (id, user_id, tier, status, current_period_end) VALUES (?, ?, 'label', 'active', ?)", crypto.randomUUID(), uidA, new Date(Date.now() + 86400e3).toISOString());
run("INSERT INTO artists (id, user_id, stage_name) VALUES (?, (SELECT id FROM profiles WHERE email = ?), 'B Artist')", crypto.randomUUID(), emailB);
const inviteMailsBefore = emailCount(emailB);
const invite2 = await A.functions.invoke('invite-artist-to-label', { body: { artistEmail: emailB, revenueSharePercentage: 40 } });
check(invite2.data?.success && invite2.data.labelArtist.status === 'pending', 'label subscriber can invite; relationship starts pending', invite2.error && (await invite2.error.context.json()));
const bArtistId = q('SELECT id FROM artists WHERE user_id = (SELECT id FROM profiles WHERE email = ?)', emailB)[0].id;
const peek = await A.functions.invoke('get-artist-detail', { body: { artistId: bArtistId } });
check(peek.error?.context?.status === 403, 'pending invite grants no access to the artist');
const pendingList = await A.functions.invoke('get-label-artists', { body: { status: 'all' } });
const pendingRow = pendingList.data?.artists?.find((x) => x.id === bArtistId);
check(pendingRow && pendingRow.stats === null, "pending invite shows no stats in the roster list", pendingRow);
const inviteMail = await lastEmail(emailB, inviteMailsBefore);
const acceptUrl = /links=(\S+)/.exec(inviteMail)?.[1];
const forged = await fetch(acceptUrl.replace(/token=[^&]+/, 'token=forged'), { redirect: 'manual' });
check(forged.headers.get('location')?.includes('invite=invalid'), 'forged accept token is refused');
const accept = await fetch(acceptUrl, { redirect: 'manual' });
check(accept.status === 303 && accept.headers.get('location')?.includes('invite=accepted'), 'artist accepts via emailed link');
const peek2 = await A.functions.invoke('get-artist-detail', { body: { artistId: bArtistId } });
check(peek2.data?.success, 'after acceptance the label can see the artist');

section('brute-force + money guards (parallel)');
run('UPDATE profiles SET pin_failed_attempts = 0, pin_locked_until = NULL WHERE id = ?', uidA);
await Promise.all(Array.from({ length: 12 }, () => A.functions.invoke('verify-transaction-pin', { body: { pin: '0000' } })));
const pinRow = q('SELECT pin_failed_attempts n, pin_locked_until l FROM profiles WHERE id = ?', uidA)[0];
const afterBurst = await A.functions.invoke('verify-transaction-pin', { body: { pin: '4821' } });
check(pinRow.n === 5 && pinRow.l && afterBurst.error?.context?.status === 429, '12 parallel PIN guesses: only 5 counted, then locked (even for the right PIN)', pinRow);
run('UPDATE profiles SET pin_failed_attempts = 0, pin_locked_until = NULL WHERE id = ?', uidA);

const emailC = `otp${stamp}@example.com`;
const before = emailCount(emailC);
await client().auth.signUp({ email: emailC, password: 'secret123' });
const realCode = /verify your email: (\d{6})/.exec(await lastEmail(emailC, before))?.[1];
await Promise.all(Array.from({ length: 20 }, (_, i) => client().auth.verifyOtp({ email: emailC, token: String((Number(realCode) + 1 + i) % 1e6).padStart(6, '0'), type: 'signup' })));
const late = await client().auth.verifyOtp({ email: emailC, token: realCode, type: 'signup' });
check(Boolean(late.error), '20 parallel wrong OTPs burn the code (correct code no longer works)');

run("UPDATE campaigns SET payment_reference = 'CMP-test' WHERE id = ?", camp.data.campaign.id);
const lateService = await A.from('campaign_services').insert({ campaign_id: camp.data.campaign.id, service_id: 'svc1' });
check(lateService.error?.code === '42501', 'services cannot be added after checkout started', lateService.error);

run('UPDATE wallet_balance SET available_balance = 1000000 WHERE user_id = ?', adm.user.id);
const admPm = crypto.randomUUID();
run("INSERT INTO payout_methods (id, user_id, recipient_code, bank_code, bank_name, account_number, account_name) VALUES (?, ?, 'RCP_adm', '058', 'GTBank', '0000000001', 'ADMIN')", admPm, adm.user.id);
run("UPDATE profiles SET kyc_status = 'verified' WHERE id = ?", adm.user.id); // payouts need verified KYC
await adm.sb.functions.invoke('setup-transaction-pin', { body: { pin: '1357' } });
const admW = await adm.sb.functions.invoke('paystack-initiate-withdrawal', { body: { payout_method_id: admPm, amount: 6000, pin: '1357' } });
const selfReview = await adm.sb.functions.invoke('admin-review-withdrawal', { body: { action: 'approve', withdrawal_id: admW.data?.data?.id } });
check(admW.data?.success && selfReview.error?.context?.status === 403, 'admins cannot approve their own withdrawal', admW.error);

const delWithFunds = await A.functions.invoke('delete-account');
check(delWithFunds.error?.context?.status === 400, 'cannot delete an account that still holds money');

section('re-authentication for credential changes');
const pinNoCurrent = await A.functions.invoke('setup-transaction-pin', { body: { pin: '2468' } });
check(pinNoCurrent.error && (await pinNoCurrent.error.context.json()).code === 'current_pin_required', 'changing the PIN requires the current PIN');
const pinWrongCurrent = await A.functions.invoke('setup-transaction-pin', { body: { pin: '2468', current_pin: '0000' } });
check(pinWrongCurrent.error?.context?.status === 400, 'wrong current PIN is refused');
const pinChanged = await A.functions.invoke('setup-transaction-pin', { body: { pin: '2468', current_pin: '4821' } });
check(pinChanged.data?.success, 'PIN changes with the correct current PIN');
const pwNoCurrent = await A.auth.updateUser({ password: 'another789' });
check(pwNoCurrent.error?.message === 'Current password is incorrect', 'password change without current password refused', pwNoCurrent.error?.message);
const emailNoCurrent = await A.auth.updateUser({ email: `x${stamp}@example.com` });
check(Boolean(emailNoCurrent.error), 'email change without current password refused');
const pwOk = await A.auth.updateUser({ password: 'another789', current_password: 'newsecret456' });
check(!pwOk.error, 'password change with current password works', pwOk.error);

section('media (R2)');
const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='), (ch) => ch.charCodeAt(0));
const token = (await A.auth.getSession()).data.session.access_token;
const anonUp = await fetch(`${API}/functions/v1/upload-media?folder=covers&name=x.png`, { method: 'POST', body: png, headers: { 'Content-Type': 'image/png' } });
check(anonUp.status === 401, 'anonymous uploads refused');
const badType = await fetch(`${API}/functions/v1/upload-media?folder=covers&name=x.html`, { method: 'POST', body: '<script>', headers: { 'Content-Type': 'text/html', Authorization: `Bearer ${token}` } });
check(badType.status === 415, 'non-media content types refused');
const svg = await fetch(`${API}/functions/v1/upload-media?folder=covers&name=x.svg`, { method: 'POST', body: '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>', headers: { 'Content-Type': 'image/svg+xml', Authorization: `Bearer ${token}` } });
check(svg.status === 415, 'SVG uploads refused (script-capable)');
const up1 = await fetch(`${API}/functions/v1/upload-media?folder=covers&name=cover.png`, { method: 'POST', body: png, headers: { 'Content-Type': 'image/png', Authorization: `Bearer ${token}` } });
const upJson = await up1.json();
check(up1.ok && upJson.url?.startsWith(`${API}/media/covers/`) && upJson.url.endsWith('.png'), 'raw upload streams into R2', upJson);
const got = await fetch(upJson.url);
check(got.ok && got.headers.get('content-type') === 'image/png' && (await got.arrayBuffer()).byteLength === png.length, 'uploaded file served back');
check(got.headers.get('content-security-policy')?.includes('sandbox'), 'media served with a sandbox CSP');
const ranged = await fetch(upJson.url, { headers: { Range: 'bytes=0-9' } });
check(ranged.status === 206 && ranged.headers.get('content-range')?.startsWith('bytes 0-9/'), 'Range requests (audio seeking)');
const form = new FormData();
form.append('file', new Blob([png], { type: 'image/png' }), 'avatar.png');
form.append('folder', 'profile-images');
const legacy = await fetch(`${API}/functions/v1/upload-image-cloudinary`, { method: 'POST', body: form, headers: { Authorization: `Bearer ${token}` } });
check(legacy.ok && (await legacy.json()).url?.includes('/media/profile-images/'), 'multipart upload via the old endpoint name');
const traversal = await fetch(`${API}/media/..%2F..%2Fsecret`);
check(traversal.status === 404, 'path traversal in media keys refused');
const kycUp = await (await fetch(`${API}/functions/v1/upload-media?folder=kyc-documents&name=id.png`, { method: 'POST', body: png, headers: { 'Content-Type': 'image/png', Authorization: `Bearer ${token}` } })).json();
check(kycUp.url?.includes('/media/private/kyc-documents/'), 'KYC uploads are stored privately', kycUp);
check((await fetch(kycUp.url)).status === 404, 'private file is not served without a signature');
const ownLink = await A.functions.invoke('media-signed-url', { body: { url: kycUp.url } });
const ownGet = await fetch(ownLink.data?.url);
check(ownGet.ok && ownGet.headers.get('cache-control') === 'private, no-store', 'owner gets a working signed link (not cached)', ownLink.error);
check((await fetch(ownLink.data.url.replace(/sig=[0-9a-f]/, (m) => (m.endsWith('0') ? 'sig=1' : 'sig=0')))).status === 404, 'tampered signature refused');
check((await fetch(ownLink.data.url.replace(/exp=\d+/, 'exp=9999999999'))).status === 404, 'extended expiry refused');
const otherLink = await B.functions.invoke('media-signed-url', { body: { url: kycUp.url } });
check(otherLink.error?.context?.status === 403, "other users cannot sign someone else's document");
const adminLink = await adm.sb.functions.invoke('media-signed-url', { body: { url: kycUp.url } });
check((await fetch(adminLink.data?.url)).ok, 'admins can open KYC documents', adminLink.error);
const subs = await A.functions.invoke('get-user-subscriptions');
check(subs.data?.hasLabelAccess === true && subs.data.accessibleTiers.includes('label'), 'get-user-subscriptions reports label access');

section('account deletion keeps the ledger');
const del = await B.functions.invoke('delete-account');
check(del.data?.message === 'Account deleted successfully', 'delete-account');
const gone = q('SELECT (SELECT COUNT(*) FROM auth_users WHERE email = ?) u, (SELECT COUNT(*) FROM profiles WHERE email = ?) p', emailB, emailB)[0];
check(gone.u === 0 && gone.p === 0, 'user + profile removed (cascade)');

section('cron');
const cron = await fetch(`${API}/cdn-cgi/local/scheduled?cron=*/15+*+*+*+*`);
check(cron.ok, 'scheduled handler runs');

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
