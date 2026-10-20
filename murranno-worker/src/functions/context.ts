import type { Context } from 'hono';
import type { AppEnv, AuthContext, Env } from '../env';
import { DB, type Row } from '../lib/db';
import { clientIp, forbidden, HttpError, unauthorized } from '../lib/http';

export interface FnCtx {
  c: Context<AppEnv>;
  env: Env;
  db: DB;
  req: Request;
  url: URL;
  ip: string;
  auth: AuthContext | null;
  /** Parsed JSON body ({} for empty/non-JSON bodies). */
  body: Row;
  /** Query string first, then JSON body — the old functions read one, the apps send the other. */
  param(name: string): any;
  waitUntil(p: Promise<unknown>): void;
}

export type Handler = (ctx: FnCtx) => Promise<unknown>;

export function requireUser(ctx: FnCtx): AuthContext {
  if (!ctx.auth) throw unauthorized();
  return ctx.auth;
}

export function requireAdmin(ctx: FnCtx): AuthContext {
  const auth = requireUser(ctx);
  if (!auth.isAdmin) throw forbidden('Admin access required');
  return auth;
}

export const fail = (status: number, error: string, extra: Record<string, unknown> = {}) => new HttpError(status, error, extra);

export async function buildCtx(c: Context<AppEnv>, auth: AuthContext | null): Promise<FnCtx> {
  const req = c.req.raw;
  const url = new URL(req.url);
  let body: Row = {};
  const type = req.headers.get('content-type') ?? '';
  if (req.method !== 'GET' && type.includes('application/json')) {
    const text = await req.clone().text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        throw fail(400, 'Invalid JSON body');
      }
    }
  }
  return {
    c,
    env: c.env,
    db: new DB(c.env.DB),
    req,
    url,
    ip: clientIp(req),
    auth,
    body: body && typeof body === 'object' ? body : {},
    param: (name) => url.searchParams.get(name) ?? body?.[name],
    waitUntil: (p) => c.executionCtx.waitUntil(p.catch((e) => console.error('background task failed', e))),
  };
}
