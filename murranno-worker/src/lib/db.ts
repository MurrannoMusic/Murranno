import { HttpError } from './http';

/**
 * Thin D1 layer that makes SQLite rows look like the Postgres rows the apps expect.
 * Column kinds come from the declared types in schema.sql (read once per isolate).
 */
export type Kind = 'text' | 'int' | 'real' | 'bool' | 'json' | 'array' | 'kobo';
export type Row = Record<string, any>;

const KINDS: Record<string, Kind> = {
  BOOLEAN: 'bool',
  JSON_TEXT: 'json',
  TEXT_ARRAY: 'array',
  KOBO: 'kobo',
  INTEGER: 'int',
  REAL: 'real',
};

let tableCache: Promise<Map<string, Map<string, Kind>>> | undefined;

async function loadTables(d1: D1Database) {
  const { results } = await d1
    .prepare(
      `SELECT m.name AS tbl, p.name AS col, p.type AS type
       FROM sqlite_master m JOIN pragma_table_info(m.name) p
       WHERE m.type = 'table' AND m.name NOT LIKE 'sqlite_%' AND m.name NOT LIKE '_cf_%'`,
    )
    .all<{ tbl: string; col: string; type: string }>();
  const map = new Map<string, Map<string, Kind>>();
  for (const r of results) {
    if (!map.has(r.tbl)) map.set(r.tbl, new Map());
    map.get(r.tbl)!.set(r.col, KINDS[r.type.toUpperCase()] ?? 'text');
  }
  return map;
}

export const now = () => new Date().toISOString();
export const uuid = () => crypto.randomUUID();
/** naira -> integer kobo (all money columns are KOBO) */
export const kobo = (naira: number | string) => Math.round(Number(naira) * 100);
export const naira = (k: number | null | undefined) => (k == null ? 0 : k / 100);

export function encode(kind: Kind | undefined, v: unknown): unknown {
  if (v === undefined || v === null) return null;
  switch (kind) {
    case 'bool':
      return v === 'false' || v === '0' ? 0 : v ? 1 : 0;
    case 'json':
    case 'array':
      return JSON.stringify(v);
    case 'kobo':
      return kobo(v as number);
    default:
      return typeof v === 'object' ? JSON.stringify(v) : v;
  }
}

export function decode(kind: Kind | undefined, v: unknown): unknown {
  if (v === null || v === undefined) return null;
  switch (kind) {
    case 'bool':
      return v === 1 || v === true || v === '1';
    case 'json':
    case 'array':
      try {
        return typeof v === 'string' ? JSON.parse(v) : v;
      } catch {
        return v;
      }
    case 'kobo':
      return Number(v) / 100;
    default:
      return v;
  }
}

const IDENT = /^[a-z_][a-z0-9_]*$/;
export function ident(name: string): string {
  if (!IDENT.test(name)) throw new HttpError(400, `Invalid identifier "${name}"`);
  return `"${name}"`;
}

export class DB {
  constructor(public d1: D1Database) {}

  tables() {
    return (tableCache ??= loadTables(this.d1).catch((e) => {
      tableCache = undefined;
      throw e;
    }));
  }

  async columns(table: string): Promise<Map<string, Kind>> {
    const cols = (await this.tables()).get(table);
    if (!cols) throw new HttpError(404, `relation "${table}" does not exist`, { code: '42P01' });
    return cols;
  }

  async decodeRow<T = any>(table: string, row: Row | null): Promise<T | null> {
    if (!row) return null;
    const cols = await this.columns(table);
    const out: Row = {};
    for (const [k, v] of Object.entries(row)) out[k] = decode(cols.get(k), v);
    return out as T;
  }

  async all<T = any>(table: string, sql: string, ...params: unknown[]): Promise<T[]> {
    const { results } = await this.d1.prepare(sql).bind(...params).all<Row>();
    return Promise.all(results.map((r) => this.decodeRow<T>(table, r))) as Promise<T[]>;
  }

  async first<T = any>(table: string, sql: string, ...params: unknown[]): Promise<T | null> {
    return this.decodeRow<T>(table, await this.d1.prepare(sql).bind(...params).first<Row>());
  }

  /** Raw single value (aggregates). */
  async value<T = number>(sql: string, ...params: unknown[]): Promise<T | null> {
    const row = await this.d1.prepare(sql).bind(...params).first<Row>();
    return row ? (Object.values(row)[0] as T) : null;
  }

  private async encodeRow(table: string, row: Row, fill: boolean) {
    const cols = await this.columns(table);
    const out: Row = {};
    for (const [k, v] of Object.entries(row)) {
      if (v === undefined) continue;
      if (!cols.has(k)) {
        throw new HttpError(400, `Could not find the '${k}' column of '${table}' in the schema cache`, { code: 'PGRST204' });
      }
      out[k] = encode(cols.get(k), v);
    }
    if (fill) {
      const ts = now();
      if (cols.has('id') && out.id == null) out.id = uuid();
      if (cols.has('created_at') && out.created_at == null) out.created_at = ts;
      if (cols.has('updated_at') && out.updated_at == null) out.updated_at = ts;
    }
    return out;
  }

  async insertStmt(table: string, row: Row): Promise<D1PreparedStatement> {
    const r = await this.encodeRow(table, row, true);
    const keys = Object.keys(r);
    return this.d1
      .prepare(`INSERT INTO ${ident(table)} (${keys.map(ident).join(', ')}) VALUES (${keys.map(() => '?').join(', ')}) RETURNING *`)
      .bind(...Object.values(r));
  }

  async insert<T = any>(table: string, row: Row): Promise<T> {
    const res = await (await this.insertStmt(table, row)).first<Row>();
    return (await this.decodeRow<T>(table, res))!;
  }

  async upsertStmt(table: string, row: Row, conflict: string[], ignoreDuplicates = false): Promise<D1PreparedStatement> {
    const r = await this.encodeRow(table, row, true);
    const keys = Object.keys(r);
    const updates = keys.filter((k) => !conflict.includes(k) && k !== 'id' && k !== 'created_at');
    const action =
      ignoreDuplicates || updates.length === 0
        ? 'DO NOTHING'
        : `DO UPDATE SET ${updates.map((k) => `${ident(k)} = excluded.${ident(k)}`).join(', ')}`;
    return this.d1
      .prepare(
        `INSERT INTO ${ident(table)} (${keys.map(ident).join(', ')}) VALUES (${keys.map(() => '?').join(', ')})
         ON CONFLICT (${conflict.map(ident).join(', ')}) ${action} RETURNING *`,
      )
      .bind(...Object.values(r));
  }

  async upsert<T = any>(table: string, row: Row, conflict: string[]): Promise<T> {
    const res = await (await this.upsertStmt(table, row, conflict)).first<Row>();
    return (await this.decodeRow<T>(table, res))!;
  }

  /** UPDATE table SET patch WHERE <where> (where uses ? placeholders bound after the patch). */
  async updateStmt(table: string, patch: Row, where: string, ...params: unknown[]): Promise<D1PreparedStatement> {
    const cols = await this.columns(table);
    const r = await this.encodeRow(table, patch, false);
    if (cols.has('updated_at') && r.updated_at == null) r.updated_at = now();
    const keys = Object.keys(r);
    return this.d1
      .prepare(`UPDATE ${ident(table)} SET ${keys.map((k) => `${ident(k)} = ?`).join(', ')} WHERE ${where} RETURNING *`)
      .bind(...Object.values(r), ...params);
  }

  async update<T = any>(table: string, patch: Row, where: string, ...params: unknown[]): Promise<T[]> {
    const { results } = await (await this.updateStmt(table, patch, where, ...params)).all<Row>();
    return Promise.all(results.map((r) => this.decodeRow<T>(table, r))) as Promise<T[]>;
  }

  async run(sql: string, ...params: unknown[]) {
    return this.d1.prepare(sql).bind(...params).run();
  }

  /** Statements run atomically (D1 wraps a batch in a transaction). */
  async batch(stmts: D1PreparedStatement[]) {
    return stmts.length ? this.d1.batch(stmts) : [];
  }

  stmt(sql: string, ...params: unknown[]) {
    return this.d1.prepare(sql).bind(...params);
  }
}

/**
 * `col IN ${list.sql}` with a single bound JSON array — D1 caps statements at 100 bound
 * parameters, so expanding one `?` per value breaks on large sets. Empty lists match nothing.
 */
export function inList(values: unknown[]): { sql: string; params: unknown[] } {
  return { sql: '(SELECT value FROM json_each(?))', params: [JSON.stringify(values)] };
}
