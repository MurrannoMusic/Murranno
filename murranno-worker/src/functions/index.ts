import type { Context } from 'hono';
import { resolveAuth } from '../auth/session';
import type { AppEnv } from '../env';
import { DB } from '../lib/db';
import { HttpError, json } from '../lib/http';
import { toPgError } from '../lib/pgerror';
import { adminFunctions } from './admin';
import { analyticsFunctions } from './analytics';
import { campaignFunctions } from './campaigns';
import { buildCtx, type Handler } from './context';
import { mediaFunctions } from './media';
import { mobileFunctions } from './mobile';
import { profileFunctions } from './profile';
import { releaseFunctions } from './releases';
import { rosterFunctions } from './roster';
import { subscriptionFunctions } from './subscriptions';
import { walletFunctions } from './wallet';
import { withdrawalFunctions } from './withdrawals';

/** Same names as the old Supabase Edge Functions, so `supabase.functions.invoke(name)` keeps working. */
const registry: Record<string, Handler> = {
  ...profileFunctions,
  ...mobileFunctions,
  ...releaseFunctions,
  ...mediaFunctions,
  ...walletFunctions,
  ...withdrawalFunctions,
  ...subscriptionFunctions,
  ...campaignFunctions,
  ...rosterFunctions,
  ...adminFunctions,
  ...analyticsFunctions,
};

export async function handleFunction(c: Context<AppEnv>): Promise<Response> {
  const handler = registry[c.req.param('name') ?? ''];
  if (!handler) return json({ error: 'Requested function was not found' }, 404);
  try {
    const ctx = await buildCtx(c, await resolveAuth(c.env, new DB(c.env.DB), c.req.raw));
    const result = await handler(ctx);
    return result instanceof Response ? result : json(result);
  } catch (e) {
    const err = e instanceof HttpError ? e : toPgError(e);
    if (err.status >= 500) console.error(`function ${c.req.param('name')} failed`, e);
    const message = err.status >= 500 && !(e instanceof HttpError) ? 'Internal server error' : err.message;
    return json({ success: false, error: message, ...err.extra }, err.status);
  }
}
