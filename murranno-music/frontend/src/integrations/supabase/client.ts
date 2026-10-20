import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { trackedFetch, watchSession } from '@/lib/appStatus';

// The Murranno API (Cloudflare Worker) speaks the same HTTP API as Supabase
// (auth/v1, rest/v1, functions/v1), so supabase-js is used purely as the client library.
export const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) throw new Error('VITE_API_URL is not set');

// Import the client like this:
// import { supabase } from "@/integrations/supabase/client";
// The key is unused by the API but required by supabase-js.
export const supabase = createClient<Database>(API_URL, 'public', {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  // Every API call feeds the offline / slow-connection banners (see lib/appStatus.ts).
  global: { fetch: trackedFetch },
});

watchSession(supabase);
