/**
 * React Native Releases Data Hook
 * Fetches and manages release data
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Release = Tables<'releases'>;

interface UseReleasesReturn {
  releases: Release[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getReleaseById: (id: string) => Release | undefined;
}

export const useReleases = (artistId: string | undefined): UseReleasesReturn => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReleases = useCallback(async () => {
    if (!artistId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('releases')
        .select('*')
        .eq('artist_id', artistId)
        .order('release_date', { ascending: false });

      if (fetchError) throw fetchError;
      setReleases(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch releases');
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  const getReleaseById = useCallback(
    (id: string) => releases.find(r => r.id === id),
    [releases]
  );

  return {
    releases,
    loading,
    error,
    refetch: fetchReleases,
    getReleaseById,
  };
};
