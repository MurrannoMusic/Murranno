/**
 * Supabase Client for React Native (Expo)
 * 
 * Copy this file to: src/services/supabase.ts
 */
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Supabase project credentials
const SUPABASE_URL = 'https://nqfltvbzqxdxsobhedci.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xZmx0dmJ6cXhkeHNvYmhlZGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NzQ2MDUsImV4cCI6MjA3NTU1MDYwNX0.aEQ0gFX0hmC5yhpzCisd5l0GqJKHbFtqfVB0xpzCqcY';

// Import your Database types (copy from current project's types.ts)
// import { Database } from '../types/supabase';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Critical for React Native - prevents URL parsing issues
  },
});

// Helper to get the current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
};

// Helper to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};

// Auth state change listener
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Sign in with email
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

// Sign up with email
export const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Reset password
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'murranno://reset-password',
  });
  return { data, error };
};

// Call edge function
export const callEdgeFunction = async <T = any>(
  functionName: string,
  body?: object
): Promise<{ data: T | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
    });
    if (error) throw error;
    return { data: data as T, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};
