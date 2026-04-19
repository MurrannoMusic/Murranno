import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EarningsBreakdown {
  bySource: { source: string; amount: number }[];
  byPlatform: { platform: string; amount: number }[];
  byRelease: { release: string; amount: number }[];
  total: number;
}

export const useEarningsBreakdown = () => {
  const [breakdown, setBreakdown] = useState<EarningsBreakdown>({
    bySource: [],
    byPlatform: [],
    byRelease: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBreakdown();
  }, []);

  const fetchBreakdown = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: artist } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!artist) return;

      // Fetch all earnings
      const { data: earnings, error } = await supabase
        .from('earnings')
        .select(`
          amount,
          source,
          platform,
          release_id,
          releases(title)
        `)
        .eq('artist_id', artist.id);

      if (error) throw error;

      if (!earnings || earnings.length === 0) {
        setLoading(false);
        return;
      }

      // Group by source
      const sourceMap: { [key: string]: number } = {};
      earnings.forEach(e => {
        if (!sourceMap[e.source]) sourceMap[e.source] = 0;
        sourceMap[e.source] += parseFloat(e.amount.toString());
      });

      // Group by platform
      const platformMap: { [key: string]: number } = {};
      earnings.forEach(e => {
        const platform = e.platform || 'Unknown';
        if (!platformMap[platform]) platformMap[platform] = 0;
        platformMap[platform] += parseFloat(e.amount.toString());
      });

      // Group by release
      const releaseMap: { [key: string]: number } = {};
      earnings.forEach(e => {
        const releaseTitle = (e.releases as any)?.title || 'Unknown Release';
        if (!releaseMap[releaseTitle]) releaseMap[releaseTitle] = 0;
        releaseMap[releaseTitle] += parseFloat(e.amount.toString());
      });

      const total = earnings.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);

      setBreakdown({
        bySource: Object.entries(sourceMap).map(([source, amount]) => ({ source, amount })),
        byPlatform: Object.entries(platformMap).map(([platform, amount]) => ({ platform, amount })),
        byRelease: Object.entries(releaseMap).map(([release, amount]) => ({ release, amount })),
        total,
      });

    } catch (error: any) {
      console.error('Error fetching earnings breakdown:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    breakdown,
    loading,
    refetch: fetchBreakdown,
  };
};
