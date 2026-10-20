import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { trackedFetch, watchSession } from '@/lib/appStatus';

// The Murranno API (Cloudflare Worker) speaks the same HTTP API as Supabase
// (auth/v1, rest/v1, functions/v1), so supabase-js is used purely as the client library.
// Expo reads environment variables starting with EXPO_PUBLIC_
export const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

if (!API_URL) {
  console.warn('⚠️ Missing EXPO_PUBLIC_API_URL in your env.');
}

// Static web rendering has no window/localStorage. Native and browser sessions
// continue using persistent device storage.
const isServerRender = Platform.OS === 'web' && typeof window === 'undefined';

// The key is unused by the API but required by supabase-js.
export const supabase = createClient(API_URL, 'public', {
  auth: {
    storage: isServerRender ? undefined : AsyncStorage,
    autoRefreshToken: !isServerRender,
    persistSession: !isServerRender,
    detectSessionInUrl: false,
  },
  global: { fetch: trackedFetch },
});

if (!isServerRender) watchSession(supabase);
