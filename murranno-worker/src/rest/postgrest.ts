import type { Context } from 'hono';
import { resolveAuth } from '../auth/session';
import type { AppEnv } from '../env';
import { DB, ident, kobo, type Kind, type Row } from '../lib/db';
import { withinLimit } from '../lib/guard';
import { clientIp, HttpError } from '../lib/http';
import { toPgError } from '../lib/pgerror';
import { policies, type PolicyCtx, type Pred, type Scope, type TablePolicy } from './policies';

/**
 * Minimal PostgREST over D1 — exactly the surface supabase-js (postgrest-js) uses in the apps:
 * select trees with embeds (`*, artist:artists!inner(stage_name)`), filters (also on embedded
 * columns), order/limit/offset, count=exact, single/maybeSingle, insert/update/delete + RETURNING.
 */

type Item =
  | { kind: 'star' }
  | { kind: 'col'; name: string; alias?: string }
  | { kind: 'embed'; name: string; alias?: string; hint?: string; inner: boolean; children: Item[]; filters: Filter[] };
type Embed = Extract<Item, { kind: 'embed' }>;
interface Filter {
  column: string;
  expr: string;
}
interface Fk {
  tbl: string;
  col: string;
  ref: string;
  refcol: string;
}
interface Rel {
  table: string;
  many: boolean;
  /** column on the parent row */
  local: string;
  /** column on the embedded row */
  remote: string;
}

const RESERVED = new Set(['select', 'order', 'limit', 'offset', 'on_conflict', 'columns']);

const pgrstError = (status: number, code: string, message: string, details: string | null = null) =>
  new HttpError(status, message, { code, details, hint: null });

// --------------------------------------------------------------- parsing ----

function splitTop(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  let quoted = false;
  for (const ch of s) {
    if (ch === '"') quoted = !quoted;
    if (!quoted && ch === '(') depth++;
    if (!quoted && ch === ')') depth--;
    if (!quoted && ch === ',' && depth === 0) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur) out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}

export function parseSelect(s: string): Item[] {
  return splitTop(s || '*').map((raw): Item => {
    if (raw === '*') return { kind: 'star' };
    let alias: string | undefined;
    let rest = raw;
    const m = /^([A-Za-z_][\w]*):(?!:)(.*)$/s.exec(raw);
    if (m) [alias, rest] = [m[1], m[2].trim()];
    const open = rest.indexOf('(');
    if (open === -1) return { kind: 'col', name: rest.split('::')[0].trim(), alias };
    if (!rest.endsWith(')')) throw pgrstError(400, 'PGRST100', `"failed to parse select parameter (${raw})"`);
    const [name, ...hints] = rest.slice(0, open).trim().split('!');
    const inner = hints.includes('inner');
    const hint = hints.find((h) => h !== 'inner' && h !== 'left');
    return { kind: 'embed', name, alias, hint, inner, children: parseSelect(rest.slice(open + 1, -1)), filters: [] };
  });
}

function parseList(v: string): string[] {
  const inner = v.replace(/^\(/, '').replace(/\)$/, '');
  return splitTop(inner).map((x) => x.replace(/^"(.*)"$/, '$1'));
}

// ------------------------------------------------------------- schema ------

let fkCache: Promise<Fk[]> | undefined;
/** D1 refuses the pragma_foreign_key_list() table function, so run the PRAGMA per table (once per isolate). */
function foreignKeys(db: DB) {
  return (fkCache ??= (async () => {
    const tables = [...(await db.tables()).keys()];
    const results = await db.batch(tables.map((t) => db.d1.prepare(`PRAGMA foreign_key_list(${ident(t)})`)));
    return results.flatMap((r, i) =>
      (r.results as { from: string; table: string; to: string | null }[]).map((f) => ({ tbl: tables[i], col: f.from, ref: f.table, refcol: f.to ?? 'id' })),
    );
  })().catch((e) => {
    fkCache = undefined;
    throw e;
  }));
}

async function resolveRel(db: DB, parent: string, e: Embed): Promise<Rel> {
  const fks = await foreignKeys(db);
  const fkName = (f: Fk) => `${f.tbl}_${f.col}_fkey`;
  // `profiles:user_id(...)` — embedding through a named FK column of the parent
  const viaColumn = fks.find((f) => f.tbl === parent && f.col === e.name);
  if (viaColumn) return { table: viaColumn.ref, many: false, local: viaColumn.col, remote: viaColumn.refcol };

  let toOne = fks.filter((f) => f.tbl === parent && f.ref === e.name);
  let toMany = fks.filter((f) => f.tbl === e.name && f.ref === parent);
  if (e.hint) {
    toOne = toOne.filter((f) => fkName(f) === e.hint || f.col === e.hint);
    toMany = toMany.filter((f) => fkName(f) === e.hint || f.col === e.hint);
  }
  const found = [...toOne.map((f) => ({ table: f.ref, many: false, local: f.col, remote: f.refcol })),
    ...toMany.map((f) => ({ table: f.tbl, many: true, local: f.refcol, remote: f.col }))];
  if (found.length === 1) return found[0];
  if (found.length === 0) {
    throw pgrstError(400, 'PGRST200', `Could not find a relationship between '${parent}' and '${e.name}' in the schema cache`);
  }
  throw pgrstError(300, 'PGRST201', `Could not embed because more than one relationship was found for '${parent}' and '${e.name}'`);
}

// ------------------------------------------------------------ policies -----

function policyFor(table: string): TablePolicy {
  const p = policies[table];
  if (!p) throw pgrstError(404, '42P01', `relation "public.${table}" does not exist`);
  return p;
}

const ALLOW: Scope = () => ({ sql: '1 = 1', params: [] });
const DENY: Scope = () => ({ sql: '0 = 1', params: [] });

function readScope(ctx: PolicyCtx, table: string): Scope {
  const p = policyFor(table);
  if (p.anonRead || ctx.auth?.isAdmin) return ALLOW;
  if (!ctx.auth || !p.select) return DENY;
  return p.select(ctx.auth.userId);
}

// ------------------------------------------------------------- filters -----

function encodeFilterValue(kind: Kind | undefined, v: string): unknown {
  if (kind === 'bool') return v === 'true' || v === '1' ? 1 : 0;
  if (kind === 'kobo') return kobo(v);
  if ((kind === 'int' || kind === 'real') && v !== '' && !Number.isNaN(Number(v))) return Number(v);
  return v;
}

async function filterSql(db: DB, table: string, alias: string, f: Filter): Promise<Pred> {
  const cols = await db.columns(table);
  if (!cols.has(f.column)) throw pgrstError(400, '42703', `column ${table}.${f.column} does not exist`);
  const kind = cols.get(f.column);
  const c = `${alias}.${ident(f.column)}`;
  let expr = f.expr;
  const negate = expr.startsWith('not.');
  if (negate) expr = expr.slice(4);
  const dot = expr.indexOf('.');
  const op = dot === -1 ? expr : expr.slice(0, dot);
  const value = dot === -1 ? '' : expr.slice(dot + 1);
  const ops: Record<string, string> = { eq: '=', neq: '!=', gt: '>', gte: '>=', lt: '<', lte: '<=' };
  let pred: Pred;
  if (ops[op]) pred = { sql: `${c} ${ops[op]} ?`, params: [encodeFilterValue(kind, value)] };
  else if (op === 'like' || op === 'ilike') pred = { sql: `${c} LIKE ?`, params: [value.replace(/\*/g, '%')] };
  else if (op === 'is') {
    const v = value.toLowerCase();
    pred = { sql: v === 'true' ? `${c} = 1` : v === 'false' ? `${c} = 0` : `${c} IS NULL`, params: [] };
  } else if (op === 'in') {
    pred = { sql: `${c} IN (SELECT value FROM json_each(?))`, params: [JSON.stringify(parseList(value).map((v) => encodeFilterValue(kind, v)))] };
  } else throw pgrstError(400, 'PGRST100', `"failed to parse filter (${f.expr})"`);
  return negate ? { sql: `NOT (${pred.sql})`, params: pred.params } : pred;
}

/** Attach `embed.path.column=op.value` filters to the embed they target. */
function distributeFilters(items: Item[], params: URLSearchParams): Filter[] {
  const top: Filter[] = [];
  for (const [key, expr] of params) {
    if (RESERVED.has(key)) continue;
    if (key === 'or' || key === 'and') throw pgrstError(400, 'PGRST100', 'logical filters are not supported');
    const path = key.split('.');
    const column = path.pop()!;
    if (path.length === 0) {
      top.push({ column, expr });
      continue;
    }
    let level = items;
    let target: Embed | undefined;
    for (const seg of path) {
      target = level.find((i): i is Embed => i.kind === 'embed' && (i.alias ?? i.name) === seg);
      if (!target) throw pgrstError(400, 'PGRST108', `'${seg}' is not an embedded resource in this request`);
      level = target.children;
    }
    target!.filters.push({ column, expr });
  }
  return top;
}

let aliasSeq = 0;
const nextAlias = () => `t${++aliasSeq}`;

async function wherePreds(ctx: PolicyCtx, table: string, alias: string, filters: Filter[], items: Item[]): Promise<Pred[]> {
  const preds: Pred[] = [readScope(ctx, table)(alias)];
  for (const f of filters) preds.push(await filterSql(ctx.db, table, alias, f));
  // `!inner` embeds restrict their parent: the related row must exist (and pass its own filters)
  for (const e of items) {
    if (e.kind !== 'embed' || !e.inner) continue;
    const rel = await resolveRel(ctx.db, table, e);
    const a = nextAlias();
    const inner = await wherePreds(ctx, rel.table, a, e.filters, e.children);
    preds.push({
      sql: `EXISTS (SELECT 1 FROM ${ident(rel.table)} ${a} WHERE ${a}.${ident(rel.remote)} = ${alias}.${ident(rel.local)} AND ${inner.map((p) => `(${p.sql})`).join(' AND ')})`,
      params: inner.flatMap((p) => p.params),
    });
  }
  return preds;
}

const joinPreds = (preds: Pred[]) => ({ sql: preds.map((p) => `(${p.sql})`).join(' AND ') || '1 = 1', params: preds.flatMap((p) => p.params) });

// ------------------------------------------------------------- reading -----

async function attachEmbeds(ctx: PolicyCtx, table: string, rows: Row[], items: Item[]) {
  for (const e of items) {
    if (e.kind !== 'embed' || rows.length === 0) continue;
    const rel = await resolveRel(ctx.db, table, e);
    const keys = [...new Set(rows.map((r) => r[rel.local]).filter((k) => k != null))];
    const a = nextAlias();
    const where = joinPreds(await wherePreds(ctx, rel.table, a, e.filters, e.children));
    const related = keys.length
      ? await ctx.db.all(
          rel.table,
          `SELECT ${a}.* FROM ${ident(rel.table)} ${a}
           WHERE ${a}.${ident(rel.remote)} IN (SELECT value FROM json_each(?)) AND ${where.sql}`,
          JSON.stringify(keys),
          ...where.params,
        )
      : [];
    masked(rel.table, related);
    await attachEmbeds(ctx, rel.table, related, e.children);
    const key = e.alias ?? e.name;
    for (const r of rows) {
      const matches = related.filter((x) => x[rel.remote] === r[rel.local]).map((x) => project(x, e.children));
      r[`\u0000${key}`] = rel.many ? matches : (matches[0] ?? null);
    }
  }
}

function masked(table: string, rows: Row[]): Row[] {
  const cols = policies[table]?.mask;
  if (cols) for (const r of rows) for (const c of cols) if (c in r) r[c] = r[c] ? true : null;
  return rows;
}

function project(row: Row, items: Item[]): Row {
  const out: Row = {};
  const star = items.some((i) => i.kind === 'star');
  if (star) for (const [k, v] of Object.entries(row)) if (!k.startsWith('\u0000')) out[k] = v;
  for (const i of items) {
    if (i.kind === 'col') out[i.alias ?? i.name] = row[i.name] ?? null;
    if (i.kind === 'embed') out[i.alias ?? i.name] = row[`\u0000${i.alias ?? i.name}`];
  }
  return out;
}

async function orderSql(db: DB, table: string, alias: string, order: string | undefined) {
  if (!order) return '';
  const cols = await db.columns(table);
  const parts = splitTop(order).map((term) => {
    const [name, ...mods] = term.split('.');
    if (!cols.has(name)) throw pgrstError(400, '42703', `column ${table}.${name} does not exist`);
    const dir = mods.includes('desc') ? 'DESC' : 'ASC';
    const nulls = mods.includes('nullsfirst') ? ' NULLS FIRST' : mods.includes('nullslast') ? ' NULLS LAST' : '';
    return `${alias}.${ident(name)} ${dir}${nulls}`;
  });
  return ` ORDER BY ${parts.join(', ')}`;
}

async function select(ctx: PolicyCtx, table: string, params: URLSearchParams, wantCount: boolean) {
  const items = parseSelect(params.get('select') ?? '*');
  const filters = distributeFilters(items, params);
  const where = joinPreds(await wherePreds(ctx, table, 't0', filters, items));
  const limit = params.get('limit');
  const offset = Number(params.get('offset') ?? 0) || 0;
  let sql = `SELECT t0.* FROM ${ident(table)} t0 WHERE ${where.sql}${await orderSql(ctx.db, table, 't0', params.get('order') ?? undefined)}`;
  const bind = [...where.params];
  if (limit != null) {
    sql += ' LIMIT ? OFFSET ?';
    bind.push(Number(limit), offset);
  } else if (offset) {
    sql += ' LIMIT -1 OFFSET ?';
    bind.push(offset);
  }
  const rows = masked(table, await ctx.db.all(table, sql, ...bind));
  await attachEmbeds(ctx, table, rows, items);
  const count = wantCount
    ? await ctx.db.value<number>(`SELECT COUNT(*) FROM ${ident(table)} t0 WHERE ${where.sql}`, ...where.params)
    : null;
  return { rows: rows.map((r) => project(r, items)), count, offset, items };
}

// ------------------------------------------------------------- writing -----

async function checkWrite(ctx: PolicyCtx, table: string, rule: TablePolicy['insert'], row: Row): Promise<Row> {
  if (ctx.auth?.isAdmin && policyFor(table).adminWrite) return row;
  if (!rule) throw pgrstError(403, '42501', `new row violates row-level security policy for table "${table}"`);
  // Server-forced columns may be sent (the apps do) but their values are always overridden.
  const forced = rule.force?.(ctx) ?? {};
  if (rule.columns) {
    const bad = Object.keys(row).filter((k) => !rule.columns!.includes(k) && !(k in forced));
    if (bad.length) throw pgrstError(403, '42501', `permission denied for column ${bad[0]} of table ${table}`);
  }
  const out = { ...row, ...forced };
  await rule.check?.(ctx, out);
  return out;
}

async function insert(ctx: PolicyCtx, table: string, body: unknown) {
  const p = policyFor(table);
  if (!ctx.auth && !p.anonInsert) throw pgrstError(401, '42501', `permission denied for table ${table}`);
  const rows = (Array.isArray(body) ? body : [body]) as Row[];
  const prepared = [];
  for (const r of rows) prepared.push(await ctx.db.insertStmt(table, await checkWrite(ctx, table, p.insert, r)));
  const results = await ctx.db.batch(prepared);
  return Promise.all(results.map((r) => ctx.db.decodeRow(table, (r.results as Row[])[0]))) as Promise<Row[]>;
}

async function mutate(ctx: PolicyCtx, table: string, params: URLSearchParams, method: 'PATCH' | 'DELETE', body: Row) {
  const p = policyFor(table);
  if (!ctx.auth) throw pgrstError(401, '42501', `permission denied for table ${table}`);
  const admin = ctx.auth.isAdmin && p.adminWrite;
  let scope: Scope | undefined;
  let patch = body;
  if (method === 'PATCH') {
    if (!admin && !p.update) throw pgrstError(403, '42501', `permission denied for table ${table}`);
    scope = admin ? ALLOW : p.update!.where(ctx.auth.userId);
    if (!admin) patch = await checkWrite(ctx, table, p.update, body);
  } else {
    if (!admin && !p.delete) throw pgrstError(403, '42501', `permission denied for table ${table}`);
    scope = admin ? ALLOW : p.delete!(ctx.auth.userId);
  }
  const filters: Filter[] = [];
  for (const [k, v] of params) if (!RESERVED.has(k)) filters.push({ column: k, expr: v });
  const preds = [scope('t0')];
  for (const f of filters) preds.push(await filterSql(ctx.db, table, 't0', f));
  const where = joinPreds(preds);
  const target = `rowid IN (SELECT t0.rowid FROM ${ident(table)} t0 WHERE ${where.sql})`;
  if (method === 'DELETE') {
    const { results } = await ctx.db.stmt(`DELETE FROM ${ident(table)} WHERE ${target} RETURNING *`, ...where.params).all<Row>();
    return Promise.all(results.map((r) => ctx.db.decodeRow(table, r))) as Promise<Row[]>;
  }
  if (Object.keys(patch).length === 0) return [];
  return ctx.db.update(table, patch, target, ...where.params);
}

// --------------------------------------------------------------- handler ---

export async function handleRest(c: Context<AppEnv>): Promise<Response> {
  const table = c.req.param('table')!;
  const req = c.req.raw;
  const url = new URL(req.url);
  const params = url.searchParams;
  const prefer = req.headers.get('Prefer') ?? '';
  const single = (req.headers.get('Accept') ?? '').includes('application/vnd.pgrst.object+json');
  const wantCount = /count=(exact|planned|estimated)/.test(prefer);
  const returnRep = prefer.includes('return=representation');
  const db = new DB(c.env.DB);
  const ctx: PolicyCtx = { auth: await resolveAuth(c.env, db, req), ip: clientIp(req), db };

  try {
    if (req.method === 'GET' || req.method === 'HEAD') {
      const { rows, count, offset } = await select(ctx, table, params, wantCount);
      const range = rows.length ? `${offset}-${offset + rows.length - 1}/${count ?? '*'}` : `*/${count ?? '*'}`;
      const headers = { 'Content-Type': 'application/json', 'Content-Range': range };
      if (single && rows.length !== 1) {
        throw pgrstError(406, 'PGRST116', 'JSON object requested, multiple (or no) rows returned', `The result contains ${rows.length} rows`);
      }
      return new Response(req.method === 'HEAD' ? null : JSON.stringify(single ? rows[0] : rows), { status: 200, headers });
    }

    const text = await req.text();
    const body = text ? JSON.parse(text) : {};
    let rows: Row[];
    if (req.method === 'POST') {
      if (prefer.includes('resolution=')) throw pgrstError(400, 'PGRST100', 'upsert is not supported over REST; use a function');
      if (!ctx.auth && !(await withinLimit(c.env, `rest-insert:${ctx.ip}:${table}`))) {
        throw pgrstError(429, 'PGRST000', 'Too many requests');
      }
      rows = await insert(ctx, table, body);
    } else if (req.method === 'PATCH' || req.method === 'DELETE') {
      rows = await mutate(ctx, table, params, req.method, body);
    } else {
      throw pgrstError(405, 'PGRST000', 'Method not allowed');
    }

    const status = req.method === 'POST' ? 201 : 200;
    if (!returnRep) return new Response(null, { status: req.method === 'POST' ? 201 : 204 });
    const items = parseSelect(params.get('select') ?? '*');
    masked(table, rows);
    await attachEmbeds(ctx, table, rows, items);
    const out = rows.map((r) => project(r, items));
    if (single && out.length !== 1) {
      throw pgrstError(406, 'PGRST116', 'JSON object requested, multiple (or no) rows returned', `The result contains ${out.length} rows`);
    }
    return new Response(JSON.stringify(single ? out[0] : out), { status, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    const err = e instanceof SyntaxError ? pgrstError(400, 'PGRST102', 'Empty or invalid json') : toPgError(e);
    if (err.status >= 500) {
      console.error('rest error', table, e);
      err.message = 'Internal server error'; // don't leak raw D1 errors
    }
    return new Response(
      JSON.stringify({ code: err.extra.code ?? 'PGRST000', details: err.extra.details ?? null, hint: err.extra.hint ?? null, message: err.message }),
      { status: err.status, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
