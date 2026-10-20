import { useSyncExternalStore } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

/** App-wide connection and session state, fed by the API client (see integrations/supabase/client.ts). */
export interface AppStatus { online: boolean; slow: boolean; sessionExpired: boolean }

const SLOW_AFTER_MS = 5000; // a request still running after this long shows the "slow connection" banner
let state: AppStatus = { online: typeof navigator === 'undefined' ? true : navigator.onLine, slow: false, sessionExpired: false };
const listeners = new Set<() => void>();
const set = (patch: Partial<AppStatus>) => {
  const next = { ...state, ...patch };
  if (next.online === state.online && next.slow === state.slow && next.sessionExpired === state.sessionExpired) return;
  state = next;
  listeners.forEach((l) => l());
};
export const useAppStatus = () => useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => state, () => state);
export const getAppStatus = () => state;
export const setOnline = (online: boolean) => set({ online });
export const dismissSessionExpired = () => set({ sessionExpired: false });

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => set({ online: true }));
  window.addEventListener('offline', () => set({ online: false, slow: false }));
}

// Requests that have been running longer than SLOW_AFTER_MS.
const slowRequests = new Set<number>();
let nextId = 0;

/** fetch for the API client: marks the connection slow while any request lags, and offline when the network fails. */
export const trackedFetch: typeof fetch = async (input, init) => {
  const id = nextId++;
  const timer = setTimeout(() => { slowRequests.add(id); set({ slow: true }); }, SLOW_AFTER_MS);
  try {
    const res = await fetch(input, init);
    if (!state.online) set({ online: true });
    return res;
  } catch (error) {
    if (error instanceof TypeError && !navigator.onLine) set({ online: false });
    throw error;
  } finally {
    clearTimeout(timer);
    slowRequests.delete(id);
    if (!slowRequests.size) set({ slow: false });
  }
};

/** Signing out on purpose must not look like an expired session. */
let intentionalSignOut = false;
export function watchSession(client: SupabaseClient<any>) {
  const signOut = client.auth.signOut.bind(client.auth);
  client.auth.signOut = (async (...args: Parameters<typeof signOut>) => {
    intentionalSignOut = true;
    try { return await signOut(...args); } finally { setTimeout(() => { intentionalSignOut = false; }, 0); }
  }) as typeof signOut;
  let hadSession = false;
  client.auth.onAuthStateChange((event, session) => {
    if (session) { hadSession = true; if (state.sessionExpired) set({ sessionExpired: false }); return; }
    if (event === 'SIGNED_OUT' && hadSession && !intentionalSignOut) set({ sessionExpired: true });
    hadSession = false;
  });
}
