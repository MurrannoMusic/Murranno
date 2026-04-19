/**
 * React Native Earnings Data Hook
 * Fetches streaming earnings and analytics
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Earning = Tables<'earnings'>;

interface EarningsSummary {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  currency: string;
}

interface UseEarningsReturn {
  earnings: Earning[];
  summary: EarningsSummary;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useEarnings = (artistId: string | undefined): UseEarningsReturn => {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEarnings = useCallback(async () => {
    if (!artistId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('earnings')
        .select('*')
        .eq('artist_id', artistId)
        .order('period_end', { ascending: false });

      if (fetchError) throw fetchError;
      setEarnings(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch earnings');
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  // Calculate summary
  const summary: EarningsSummary = {
    totalEarnings: earnings.reduce((sum, e) => sum + e.amount, 0),
    pendingEarnings: earnings
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0),
    paidEarnings: earnings
      .filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0),
    currency: earnings[0]?.currency ?? 'NGN',
  };

  return {
    earnings,
    summary,
    loading,
    error,
    refetch: fetchEarnings,
  };
};
