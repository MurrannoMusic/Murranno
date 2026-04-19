/**
 * Supabase Client Configuration for React Native
 * 
 * Uses expo-secure-store for secure session storage.
 * This is the recommended approach for React Native apps.
 */
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Environment variables (set in .env or app.config.js)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Secure storage adapter using expo-secure-store
 * Falls back to in-memory storage for web/unsupported platforms
 */
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      // SecureStore has a 2048 byte limit per key on iOS
      // For larger data, we need to chunk it
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn('SecureStore getItem error:', error);
      return null;
    }
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn('SecureStore setItem error:', error);
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn('SecureStore removeItem error:', error);
    }
  },
};

/**
 * Supabase client instance
 * 
 * Configuration notes:
 * - Uses SecureStore for encrypted session storage on iOS/Android
 * - autoRefreshToken: Automatically refreshes tokens before expiry
 * - persistSession: Maintains session across app restarts
 * - detectSessionInUrl: Disabled for React Native (no URL-based auth)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Export types for convenience
export type { User, Session, AuthError } from '@supabase/supabase-js';
