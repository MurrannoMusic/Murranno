import type { Env } from '../env';
import { hmacHex, timingSafeEqual } from './crypto';
import { HttpError } from './http';

function secret(env: Env): string {
  if (!env.PAYSTACK_SECRET_KEY) throw new HttpError(500, 'Paystack secret key not configured');
  return env.PAYSTACK_SECRET_KEY;
}

export interface PaystackResult<T = any> {
  status: boolean;
  message: string;
  data: T;
  /** HTTP status; 0 when the body wasn't JSON. Only a 4xx is a definitive refusal. */
  httpStatus: number;
}

export async function paystack<T = any>(env: Env, path: string, init: { method?: string; body?: unknown } = {}): Promise<PaystackResult<T>> {
  const res = await fetch(`https://api.paystack.co${path}`, {
    method: init.method ?? (init.body ? 'POST' : 'GET'),
    headers: { Authorization: `Bearer ${secret(env)}`, 'Content-Type': 'application/json' },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  let parsed = true;
  const data = (await res.json().catch(() => {
    parsed = false;
    return { status: false, message: `Paystack HTTP ${res.status}` };
  })) as PaystackResult<T>;
  return { ...data, status: res.ok && data.status === true, httpStatus: parsed ? res.status : 0 };
}

/** Paystack signs webhooks with HMAC-SHA512(secret key, raw body), hex encoded. */
export async function verifyPaystackSignature(env: Env, rawBody: string, signature: string | null): Promise<boolean> {
  if (!signature || !env.PAYSTACK_SECRET_KEY) return false;
  return timingSafeEqual(await hmacHex('SHA-512', env.PAYSTACK_SECRET_KEY, rawBody), signature.toLowerCase());
}

/** Paystack sometimes delivers metadata as a JSON string. */
export function metadataOf(data: { metadata?: unknown }): Record<string, any> {
  const m = data?.metadata;
  if (typeof m === 'string') {
    try {
      return JSON.parse(m);
    } catch {
      return {};
    }
  }
  return (m as Record<string, any>) ?? {};
}

export const paystackReference = (prefix: string) => `${prefix}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
