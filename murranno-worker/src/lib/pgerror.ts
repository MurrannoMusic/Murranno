import { HttpError } from './http';

/** Map SQLite/D1 errors onto the Postgres error codes the apps (and old functions) check for. */
export function toPgError(e: unknown): HttpError {
  if (e instanceof HttpError) return e;
  const msg = e instanceof Error ? e.message : String(e);
  const rules: [RegExp, number, string][] = [
    [/UNIQUE constraint failed/i, 409, '23505'],
    [/FOREIGN KEY constraint failed/i, 409, '23503'],
    [/CHECK constraint failed/i, 400, '23514'],
    [/NOT NULL constraint failed/i, 400, '23502'],
    [/no such column/i, 400, '42703'],
    [/append-only/i, 400, 'P0001'],
  ];
  for (const [re, status, code] of rules) {
    if (re.test(msg)) return new HttpError(status, msg.replace(/^D1_ERROR:\s*/, ''), { code });
  }
  return new HttpError(500, msg);
}
