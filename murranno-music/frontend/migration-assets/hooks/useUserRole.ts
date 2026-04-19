/**
 * React Native User Role Hook
 * Determines user tier (artist, label, agency, admin)
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserTier = Database['public']['Enums']['user_tier'];

interface UseUserRoleReturn {
  tier: UserTier | null;
  isAdmin: boolean;
  isLabel: boolean;
  isAgency: boolean;
  isArtist: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserRole = (userId: string | undefined): UseUserRoleReturn => {
  const [tier, setTier] = useState<UserTier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRole = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_roles')
        .select('tier')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        // User might not have a role yet, default to artist
        if (fetchError.code === 'PGRST116') {
          setTier('artist');
        } else {
          throw fetchError;
        }
      } else {
        setTier(data?.tier ?? 'artist');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user role');
      setTier('artist'); // Default fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [userId]);

  return {
    tier,
    isAdmin: tier === 'admin',
    isLabel: tier === 'label',
    isAgency: tier === 'agency',
    isArtist: tier === 'artist',
    loading,
    error,
    refetch: fetchUserRole,
  };
};
