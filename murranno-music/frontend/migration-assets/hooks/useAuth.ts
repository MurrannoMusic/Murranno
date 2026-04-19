/**
 * React Native Auth Hook Template
 * 
 * Expo equivalent of the Capacitor auth context
 */
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase, getSession, signInWithEmail, signUpWithEmail, signOut as supabaseSignOut } from '../services/supabase';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Toast from 'react-native-toast-message';

// Types
interface User {
  id: string;
  email?: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
}

interface AuthContextType {
  user: User | null;
  session: any;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Complete WebBrowser auth session
WebBrowser.maybeCompleteAuthSession();

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Check for existing session
    const initAuth = async () => {
      try {
        const currentSession = await getSession();
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with email
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) throw error;
      
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: 'You have successfully signed in.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Sign in failed',
        text2: error.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      const { data, error } = await signUpWithEmail(email, password, fullName);
      
      if (error) throw error;
      
      Toast.show({
        type: 'success',
        text1: 'Account created!',
        text2: 'Please check your email for verification.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Sign up failed',
        text2: error.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      await supabaseSignOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      
      Toast.show({
        type: 'success',
        text1: 'Signed out',
        text2: 'You have been signed out successfully.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Sign out failed',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // Create OAuth URL
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'murranno',
        path: 'auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL returned');

      // Open browser for OAuth
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (result.type === 'success') {
        // Parse the URL and extract tokens
        const url = result.url;
        const params = new URL(url).hash.substring(1);
        const urlParams = new URLSearchParams(params);
        
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Google sign in failed',
        text2: error.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPasswordForEmail = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'murranno://reset-password',
      });
      
      if (error) throw error;
      
      Toast.show({
        type: 'success',
        text1: 'Check your email',
        text2: 'Password reset instructions have been sent.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Reset failed',
        text2: error.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPasswordForEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
