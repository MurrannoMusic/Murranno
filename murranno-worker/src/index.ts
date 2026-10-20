import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './auth/routes';
import type { AppEnv, Env } from './env';
import { handleFunction } from './functions';
import { serveMedia } from './functions/media';
import { isAllowedUrl } from './lib/guard';
import { HttpError, json } from './lib/http';
import { handleRest } from './rest/postgrest';
import { paystackWebhook, scheduled } from './webhooks';

/**
 * Murranno API. Speaks the same HTTP surface supabase-js uses (auth/v1, rest/v1, functions/v1),
 * so the web and Expo apps only need their base URL pointed here.
 */
const app = new Hono<AppEnv>();

// Tokens signed with a missing/short secret would be forgeable: refuse to serve instead.
app.use('*', async (c, next) => {
  if (!c.env.JWT_SECRET || c.env.JWT_SECRET.length < 32) {
    console.error('JWT_SECRET is missing or shorter than 32 characters');
    return json({ error: 'Server misconfigured' }, 500);
  }
  await next();
});

app.use(
  '*',
  cors({
    // Native apps send no Origin; browsers must be on the allow-list.
    origin: (origin, c) => (!origin || isAllowedUrl(c.env, origin) ? origin : null),
    allowMethods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Range', 'Content-Disposition', 'X-Supabase-Api-Version'],
    maxAge: 86400,
  }),
);

app.get('/health', (c) => c.json({ status: 'ok' }));
app.on(['GET', 'HEAD'], '/media/*', serveMedia);

app.route('/auth/v1', authRoutes);

app.on(['GET', 'HEAD', 'POST', 'PATCH', 'DELETE'], '/rest/v1/:table', handleRest);

// Paystack: one canonical URL, plus the two old function URLs so either can be configured.
app.post('/webhooks/paystack', paystackWebhook);
app.post('/functions/v1/paystack-subscription-webhook', paystackWebhook);
app.post('/functions/v1/paystack-campaign-payment-webhook', paystackWebhook);
app.all('/functions/v1/:name', handleFunction);

// Supabase Realtime is not provided; subscriptions fail fast and screens fall back to refetching.
app.all('/realtime/v1/*', (c) => c.text('Realtime is not available on this backend', 404));

app.notFound(() => json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  if (err instanceof HttpError) {
    if (err.extra.__auth) {
      const { __auth: _, ...body } = err.extra;
      return json(body, err.status);
    }
    return json({ error: err.message, ...err.extra }, err.status);
  }
  console.error('unhandled error', c.req.method, c.req.path, err);
  return json({ error: 'Internal server error' }, 500);
});

export default {
  fetch: app.fetch,
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(scheduled(env));
  },
} satisfies ExportedHandler<Env>;
