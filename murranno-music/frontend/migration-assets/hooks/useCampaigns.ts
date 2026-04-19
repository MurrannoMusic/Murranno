/**
 * React Native Campaigns Data Hook
 * Fetches and manages campaign/promotion data
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Campaign = Tables<'campaigns'>;

interface UseCampaignsReturn {
  campaigns: Campaign[];
  activeCampaigns: Campaign[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getCampaignById: (id: string) => Campaign | undefined;
}

export const useCampaigns = (userId: string | undefined): UseCampaignsReturn => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCampaigns(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const activeCampaigns = campaigns.filter(
    c => c.status === 'active' || c.status === 'pending'
  );

  const getCampaignById = useCallback(
    (id: string) => campaigns.find(c => c.id === id),
    [campaigns]
  );

  return {
    campaigns,
    activeCampaigns,
    loading,
    error,
    refetch: fetchCampaigns,
    getCampaignById,
  };
};
