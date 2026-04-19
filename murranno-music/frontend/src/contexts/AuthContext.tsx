import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isNativeApp } from '@/utils/platformDetection';

type UserTier = 'artist' | 'label' | 'agency' | 'admin';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  kyc_tier: number;
  kyc_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  nin_number: string | null;
  id_document_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  tier: UserTier;
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  tier: UserTier;
  status: string;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  isActive?: boolean;
  isTrial?: boolean;
  daysRemaining?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRole: UserRole | null;
  subscriptions: Subscription[];
  accessibleTiers: string[];
  loading: boolean;
  verifyEmailOtp: (email: string, token: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, phone: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  isArtist: boolean;
  hasLabelAccess: boolean;
  hasAgencyAccess: boolean;
  hasActiveSubscription: boolean;
  refreshUserData: () => Promise<void>;
  resendEmailOtp: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [accessibleTiers, setAccessibleTiers] = useState<string[]>(['artist']);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Check if banned
      if (profileData && (profileData as any).banned) {
        throw new Error((profileData as any).ban_reason ? `Account Banned: ${(profileData as any).ban_reason}` : "Your account has been banned.");
      }

      setProfile(profileData as Profile);

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (roleError) throw roleError;
      setUserRole(roleData);

      // Fetch subscriptions (multiple add-ons)
      const { data: subData } = await supabase.functions.invoke('get-user-subscriptions');
      if (subData?.success) {
        setSubscriptions(subData.subscriptions || []);
        setAccessibleTiers(subData.accessibleTiers || ['artist']);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer data fetching to avoid blocking auth state change
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRole(null);
          setSubscriptions([]);
          setAccessibleTiers(['artist']);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          fetchUserData(session.user.id);
        }, 0);
      }
      setLoading(false);
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string, phone: string) => {
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            first_name: firstName,
            last_name: lastName,
            phone_number: phone,
          },
        },
      });

      if (error) {
        toast({
          title: 'Signup failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Welcome!',
          description: 'Your account has been created with a 14-day free trial.',
        });

        // Send welcome email for new user
        if (data.user) {
          setTimeout(async () => {
            try {
              await supabase.functions.invoke('send-welcome-email', {
                body: { userId: data.user.id }
              });
              console.log('Welcome email queued for new user');
            } catch (err) {
              console.error('Failed to queue welcome email:', err);
              // Don't show error to user, this is a background operation
            }
          }, 1000); // Wait 1 second to ensure user profile is created
        }
      }

      return { error };
    } catch (error: any) {
      return { error };
    }
  };


  const verifyEmailOtp = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });

      if (error) {
        toast({
          title: 'Verification failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Email verified!',
          description: 'Your account has been successfully verified.',
        });
      }

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const resendEmailOtp = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Code resent',
          description: 'Please check your email for the new code.',
        });
      }

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
      }

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserRole(null);
      setSubscriptions([]);
      setAccessibleTiers(['artist']);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Use HTTPS callback URL for both web and native
      const redirectUrl = isNativeApp()
        ? `${window.location.origin}/auth/callback?platform=native`
        : `${window.location.origin}/auth/callback`;

      if (isNativeApp()) {
        // For native apps, get the OAuth URL and open in in-app browser
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }

        if (data?.url) {
          // Open OAuth URL in in-app browser
          const { Browser } = await import('@capacitor/browser');
          await Browser.open({
            url: data.url,
            toolbarColor: '#1DB954',
          });
          // The callback page will handle closing the browser and completing auth
        }
      } else {
        // For web, use standard OAuth flow
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
          },
        });

        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const signInWithApple = async () => {
    try {
      // Use HTTPS callback URL for both web and native
      const redirectUrl = isNativeApp()
        ? `${window.location.origin}/auth/callback?platform=native`
        : `${window.location.origin}/auth/callback`;

      if (isNativeApp()) {
        // For native apps, get the OAuth URL and open in in-app browser
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }

        if (data?.url) {
          // Open OAuth URL in in-app browser
          const { Browser } = await import('@capacitor/browser');
          await Browser.open({
            url: data.url,
            toolbarColor: '#000000',
          });
          // The callback page will handle closing the browser and completing auth
        }
      } else {
        // For web, use standard OAuth flow
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: redirectUrl,
          },
        });

        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Derived state
  const isArtist = true; // Always true for authenticated users
  const hasLabelAccess = accessibleTiers.includes('label');
  const hasAgencyAccess = accessibleTiers.includes('agency');

  const hasActiveSubscription = subscriptions.some(sub => sub.isActive);

  const value: AuthContextType = {
    user,
    session,
    profile,
    userRole,
    subscriptions,
    accessibleTiers,
    loading,
    verifyEmailOtp,
    signUp,
    signIn,
    signOut,
    resetPasswordForEmail,
    signInWithGoogle,
    signInWithApple,
    isArtist,
    hasLabelAccess,
    hasAgencyAccess,
    hasActiveSubscription,
    refreshUserData,
    resendEmailOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
