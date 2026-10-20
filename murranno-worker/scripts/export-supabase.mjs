// Export the Supabase Postgres database into a SQL file for D1.
//
//   SUPABASE_DB_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres \
//   SUPABASE_CA_CERT=./prod-ca-2021.crt \
//     node scripts/export-supabase.mjs            -> export/murranno-data.sql
//   node scripts/export-supabase.mjs --check      -> self-test (no database needed)
//
// Then: npx wrangler d1 execute murranno-db --remote --file=export/murranno-data.sql
//
// - Users keep their ids and passwords (GoTrue bcrypt hashes verify in the worker).
// - Money columns (KOBO) are converted naira -> integer kobo; booleans/JSON/arrays to D1 encodings.
// - Rows pointing at a missing parent: nullable FK -> set NULL, required FK -> skipped (reported).
// - Sessions are not migrated: everyone signs in again once after the cutover.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

// Normalise CRLF (Windows checkouts) so the line-based parser below sees every column.
const SCHEMA = readFileSync(new URL('../src/db/schema.sql', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const SKIP = new Set(['auth_sessions', 'auth_tokens', 'payments', 'idempotency_keys', 'withdrawal_otps']);
// Financial rows must never be silently dropped: plain INSERT (fails loudly). Others ignore duplicates.
const STRICT = new Set(['wallet_balance', 'withdrawal_transactions', 'earnings', 'payout_methods', 'subscriptions', 'campaigns', 'artists', 'releases', 'tracks']);
const SOURCE = {
  auth_users: `SELECT id, email, encrypted_password, email_confirmed_at, last_sign_in_at, raw_user_meta_data,
                      raw_app_meta_data, banned_until, created_at, updated_at FROM auth.users WHERE email IS NOT NULL`,
  auth_identities: `SELECT id, user_id, provider, provider_id, identity_data, created_at, updated_at FROM auth.identities`,
};

// Logins whose profile was deleted in Supabase get the rows sign-up creates (session.ts provisionStatements),
// otherwise they could sign in to a broken account. Existing rows are never touched.
const meta = (k) => `json_extract(raw_user_meta_data, '$.${k}')`;
const REPAIR = [
  '-- repair: accounts missing their sign-up rows',
  `INSERT OR IGNORE INTO profiles (id, email, full_name, first_name, last_name, phone_number, avatar_url)
  SELECT id, email, COALESCE(${meta('full_name')}, NULLIF(TRIM(COALESCE(${meta('first_name')}, '') || ' ' || COALESCE(${meta('last_name')}, '')), '')),
         ${meta('first_name')}, ${meta('last_name')}, COALESCE(${meta('phone_number')}, ${meta('phone')}), ${meta('avatar_url')}
  FROM auth_users WHERE id NOT IN (SELECT id FROM profiles);`,
  ...['user_roles', 'wallet_balance', 'notification_preferences'].map(
    (t) =>
      `INSERT INTO ${t} (user_id${t === 'user_roles' ? ', tier' : ''}) SELECT id${t === 'user_roles' ? ", 'artist'" : ''} FROM profiles
  WHERE id NOT IN (SELECT user_id FROM ${t} WHERE user_id IS NOT NULL);`,
  ),
];

/** Parse schema.sql: tables in declaration order with column kinds and FKs. */
export function parseSchema(sql) {
  const tables = [];
  for (const m of sql.matchAll(/CREATE TABLE IF NOT EXISTS (\w+) \(([\s\S]*?)\n\);/g)) {
    const columns = [];
    for (const line of m[2].split('\n')) {
      const c = /^\s+(\w+)\s+([A-Z_]+)(.*)$/.exec(line);
      if (!c || ['UNIQUE', 'PRIMARY', 'CHECK', 'FOREIGN'].includes(c[1])) continue;
      const ref = /REFERENCES (\w+)\((\w+)\)/.exec(c[3]);
      columns.push({
        name: c[1],
        kind: { KOBO: 'kobo', BOOLEAN: 'bool', JSON_TEXT: 'json', TEXT_ARRAY: 'array', INTEGER: 'int', REAL: 'real' }[c[2]] ?? 'text',
        notNull: /NOT NULL|PRIMARY KEY/.test(c[3]),
        ref: ref ? { table: ref[1], column: ref[2] } : null,
      });
    }
    tables.push({ name: m[1], columns });
  }
  return tables;
}

const iso = (v) => (v instanceof Date ? v.toISOString() : v);

export function convert(kind, v) {
  if (v === null || v === undefined) return null;
  switch (kind) {
    case 'kobo':
      return Math.round(Number(v) * 100);
    case 'bool':
      return v === true || v === 't' || v === 1 ? 1 : 0;
    case 'json':
    case 'array':
      return JSON.stringify(typeof v === 'string' && kind === 'json' ? JSON.parse(v) : v);
    case 'int':
    case 'real':
      return Number(v);
    default:
      return typeof v === 'object' && !(v instanceof Date) ? JSON.stringify(v) : iso(v);
  }
}

const literal = (v) => (v === null ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);

/** Turn source rows into INSERT statements, enforcing FK integrity against already-exported parents. */
export function exportTable(table, rows, seen, report) {
  const out = [];
  const keys = (seen[table.name] ??= new Set());
  const verb = STRICT.has(table.name) ? 'INSERT' : 'INSERT OR IGNORE';
  for (const src of rows) {
    const row = {};
    let skip = false;
    for (const col of table.columns) {
      if (!(col.name in src)) continue;
      let v = convert(col.kind, src[col.name]);
      if (v !== null && col.ref && seen[col.ref.table] && !seen[col.ref.table].has(String(v))) {
        if (col.notNull) {
          skip = true;
          report.push(`${table.name}: skipped row ${src.id ?? ''} (missing ${col.ref.table} ${v})`);
          break;
        }
        report.push(`${table.name}: ${col.name} ${v} -> NULL (missing ${col.ref.table})`);
        v = null;
      }
      row[col.name] = v;
    }
    if (skip) continue;
    if (row.id != null) keys.add(String(row.id));
    const cols = Object.keys(row);
    out.push(`${verb} INTO ${table.name} (${cols.join(', ')}) VALUES (${cols.map((c) => literal(row[c])).join(', ')});`);
  }
  // FK targets that aren't `id` (e.g. profiles.id is also the auth user id) are covered by `id`.
  return out;
}

async function exportAll() {
  const url = process.env.SUPABASE_DB_URL;
  if (!url) throw new Error('Set SUPABASE_DB_URL (Supabase dashboard → Connect → Session pooler)');
  const { default: pg } = await import('pg');
  pg.types.setTypeParser(1082, (v) => v); // keep DATE columns as YYYY-MM-DD strings
  // Supabase certificates chain to Supabase's own root CA (Dashboard → Database → SSL → Download certificate).
  const ca = process.env.SUPABASE_CA_CERT ? readFileSync(process.env.SUPABASE_CA_CERT, 'utf8') : undefined;
  const client = new pg.Client({ connectionString: url, ssl: ca ? { ca } : true });
  await client.connect();

  const negative = await client.query('SELECT user_id, available_balance, pending_balance FROM public.wallet_balance WHERE available_balance < 0 OR pending_balance < 0');
  if (negative.rows.length) {
    console.error('Refusing to export: negative wallet balances must be reconciled first:', negative.rows);
    process.exit(1);
  }
  // D1 allows one artist profile per account; merge duplicates in Supabase first so no releases are orphaned.
  const dupArtists = await client.query('SELECT user_id, array_agg(id) AS artist_ids FROM public.artists WHERE user_id IS NOT NULL GROUP BY user_id HAVING COUNT(*) > 1');
  if (dupArtists.rows.length) {
    console.error('Refusing to export: these accounts have more than one artist profile:', dupArtists.rows);
    process.exit(1);
  }

  const lines = ['-- Murranno data export', `-- generated ${new Date().toISOString()}`, 'PRAGMA defer_foreign_keys = true;'];
  const seen = {};
  const report = [];
  for (const table of parseSchema(SCHEMA)) {
    if (SKIP.has(table.name)) continue;
    let sql = SOURCE[table.name];
    if (!sql) {
      const exists = await client.query(
        "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1",
        [table.name],
      );
      if (!exists.rows.length) {
        console.log(`- ${table.name}: not in Supabase, skipped`);
        continue;
      }
      const shared = table.columns.map((c) => c.name).filter((c) => exists.rows.some((r) => r.column_name === c));
      sql = `SELECT ${shared.map((c) => `"${c}"`).join(', ')} FROM public."${table.name}"`;
    }
    const { rows } = await client.query(sql);
    const stmts = exportTable(table, rows, seen, report);
    // The app reads the single settings row (LIMIT 1): Supabase's replaces the default one from seed.sql.
    if (table.name === 'platform_settings' && stmts.length) lines.push('DELETE FROM platform_settings;');
    lines.push(`-- ${table.name}: ${stmts.length} rows`, ...stmts);
    console.log(`- ${table.name}: ${stmts.length}/${rows.length} rows`);
  }
  await client.end();
  lines.push(...REPAIR);

  // Owner-only: the export holds password hashes and personal data (delete it after the import).
  mkdirSync('export', { recursive: true, mode: 0o700 });
  writeFileSync('export/murranno-data.sql', `${lines.join('\n')}\n`, { mode: 0o600 });
  if (report.length) writeFileSync('export/integrity-report.txt', `${report.join('\n')}\n`, { mode: 0o600 });
  console.log(`\nWrote export/murranno-data.sql${report.length ? ` (${report.length} integrity notes in export/integrity-report.txt)` : ''}`);
}

/** Self-test: fixture rows -> SQL -> load into a fresh SQLite with the real schema. */
function check() {
  const tables = Object.fromEntries(parseSchema(SCHEMA).map((t) => [t.name, t]));
  const seen = {};
  const report = [];
  const uid = '11111111-1111-1111-1111-111111111111';
  const stmts = [
    ...exportTable(tables.auth_users, [{ id: uid, email: "o'brien@example.com", encrypted_password: '$2a$10$abc', raw_user_meta_data: { full_name: 'O B' }, created_at: new Date('2026-01-01T00:00:00Z'), updated_at: new Date('2026-01-01T00:00:00Z') }], seen, report),
    ...exportTable(tables.profiles, [{ id: uid, email: "o'brien@example.com", banned: false, kyc_status: 'pending' }], seen, report),
    ...exportTable(tables.wallet_balance, [{ id: 'w1', user_id: uid, available_balance: '1234.56', pending_balance: '0', total_earnings: 99.99, currency: 'NGN' }], seen, report),
    ...exportTable(tables.artists, [{ id: 'a1', user_id: 'ghost', stage_name: 'Orphan' }], seen, report),
    ...exportTable(tables.releases, [{ id: 'r1', artist_id: 'a1', title: 'T', release_type: 'Single', release_date: '2026-02-01', status: 'Draft', distribution_platforms: ['spotify'] }, { id: 'r2', artist_id: 'nope', title: 'X', release_type: 'Single', release_date: '2026-02-01' }], seen, report),
  ];
  const db = new DatabaseSync(':memory:');
  db.exec(SCHEMA);
  db.exec(['PRAGMA defer_foreign_keys = true;', 'BEGIN;', ...stmts, 'COMMIT;'].join('\n'));
  const w = db.prepare('SELECT available_balance a, total_earnings t FROM wallet_balance').get();
  const p = db.prepare('SELECT email, banned FROM profiles').get();
  const a = db.prepare('SELECT user_id FROM artists').get();
  const r = db.prepare('SELECT COUNT(*) n, MAX(distribution_platforms) d FROM releases').get();
  const assert = (c, m) => {
    if (!c) throw new Error(`check failed: ${m}`);
    console.log(`ok - ${m}`);
  };
  assert(w.a === 123456 && w.t === 9999, 'money converted to integer kobo (no float drift)');
  assert(p.email === "o'brien@example.com" && p.banned === 0, 'quotes escaped, booleans as 0/1');
  assert(a.user_id === null, 'orphaned nullable FK set to NULL');
  assert(r.n === 1 && r.d === '["spotify"]', 'row with missing required parent skipped; arrays as JSON');
  assert(report.length === 2, 'integrity issues reported');
}

if (process.argv.includes('--check')) check();
else await exportAll();
