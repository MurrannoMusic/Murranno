import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUserType = () => {
  const [accessibleTiers, setAccessibleTiers] = useState<string[]>(['artist']);
  const [currentViewingTier, setCurrentViewingTier] = useState<'artist' | 'label' | 'agency'>('artist');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();

    // Load last viewed dashboard from localStorage
    const lastViewed = localStorage.getItem('lastViewedDashboard') as 'artist' | 'label' | 'agency';
    if (lastViewed) {
      setCurrentViewingTier(lastViewed);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setAccessibleTiers(['artist']);
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      console.log('useUserType: fetched user:', user?.id);

      if (!user) {
        setAccessibleTiers(['artist']);
        setCurrentUser(null);
        return;
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase.functions.invoke('get-profile');
      console.log('useUserType: profile data:', profileData, 'error:', profileError);
      if (profileError) throw profileError;

      if (profileData?.success && profileData.profile) {
        setCurrentUser({
          id: profileData.profile.id,
          name: profileData.profile.full_name,
          email: profileData.profile.email,
          accountType: 'artist', // Base type
        });
        console.log('useUserType: set currentUser:', profileData.profile);
      } else {
        console.log('useUserType: profile fetch failed or no profile, setting default');
        // Set default currentUser if profile doesn't exist
        setCurrentUser({
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          accountType: 'artist',
        });
      }

      // Fetch accessible tiers from subscriptions
      const { data: subData } = await supabase.functions.invoke('get-user-subscriptions');
      console.log('useUserType: subscriptions data:', subData);
      if (subData?.success) {
        setAccessibleTiers(subData.accessibleTiers || ['artist']);
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
      setAccessibleTiers(['artist']); // Fallback
    } finally {
      setLoading(false);
    }
  };

  const switchDashboard = (tier: 'artist' | 'label' | 'agency') => {
    if (!accessibleTiers.includes(tier)) {
      toast.error(`You don't have access to ${tier} dashboard`);
      return;
    }

    setCurrentViewingTier(tier);
    localStorage.setItem('lastViewedDashboard', tier);
    toast.success(`Switched to ${tier} dashboard`);
  };

  const selectArtist = (artistId: string) => {
    setSelectedArtist(artistId);
  };

  // Legacy function for backward compatibility
  const switchUserType = async (newType: 'artist' | 'label' | 'agency' | 'admin') => {
    // Admin doesn't need dashboard switching
    if (newType === 'admin') {
      toast.info('Admin access is managed separately');
      return;
    }
    // This now just switches the viewing dashboard
    switchDashboard(newType);
  };

  return {
    accessibleTiers,
    currentViewingTier,
    currentUser,
    selectedArtist,
    loading,
    switchDashboard,
    selectArtist,
    switchUserType, // Legacy support
    refetch: fetchUserData,
    isArtist: true, // Always true for authenticated users
    hasLabelAccess: accessibleTiers.includes('label'),
    hasAgencyAccess: accessibleTiers.includes('agency'),
    // Legacy support
    userType: currentViewingTier,
    currentUserType: currentViewingTier,
    isLabel: currentViewingTier === 'label',
    isAgency: currentViewingTier === 'agency',
  };
};
