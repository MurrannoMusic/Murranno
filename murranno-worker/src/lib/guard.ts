import type { Env } from '../env';

/** True when `candidate` is on the allow-list (exact host for http(s), prefix for app schemes). */
export function isAllowedUrl(env: Env, candidate: string | null | undefined): boolean {
  if (!candidate) return false;
  const entries = [env.APP_URL, ...env.ALLOWED_REDIRECTS.split(','), 'murrannoexpo://auth/callback', 'murrannoexpo://reset-password', 'murrannoexpo://payment-return'].map((s) => s.trim()).filter(Boolean);
  let c: URL;
  try {
    c = new URL(candidate);
  } catch {
    return false;
  }
  return entries.some((entry) => {
    let e: URL;
    try {
      e = new URL(entry);
    } catch {
      return false;
    }
    if (e.protocol !== c.protocol) return false;
    if (e.protocol === 'http:' || e.protocol === 'https:') return e.hostname === c.hostname && (!e.port || e.port === c.port);
    return candidate.startsWith(entry);
  });
}

/** Never redirect to a URL that isn't ours (open-redirect / token leak protection). */
export function safeRedirect(env: Env, candidate?: string | null): string {
  return candidate && isAllowedUrl(env, candidate) ? candidate : env.APP_URL;
}

/** Returns false when the caller is over the limit. Fails closed in production if the binding is missing. */
export async function withinLimit(env: Env, key: string): Promise<boolean> {
  if (!env.AUTH_LIMITER) return env.ENVIRONMENT !== 'production';
  const { success } = await env.AUTH_LIMITER.limit({ key });
  return success;
}
