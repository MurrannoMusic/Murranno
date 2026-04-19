import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsSummary {
  totalStreams: number;
  bestPlatform: { name: string; streams: number } | null;
  topCountry: { name: string; streams: number } | null;
  mostStreamedTrack: { title: string; release: string; streams: number } | null;
  dateRange: string;
}

export const useAnalyticsData = (period: number = 7) => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: res, error } = await supabase.functions.invoke('get-analytics-data', {
        body: { period },
      });
      if (error) throw error;
      if (!res?.success) throw new Error(res?.error || 'Failed');

      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - period);
      const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      setData({
        totalStreams: res.totalStreams || 0,
        bestPlatform: res.bestPlatform || null,
        topCountry: res.topCountry || null,
        mostStreamedTrack:
          res.topTracks?.length > 0
            ? {
                title: res.topTracks[0].title,
                release: res.topTracks[0].release,
                streams: res.topTracks[0].streams,
              }
            : null,
        dateRange: `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`,
      });
    } catch (err) {
      console.error('useAnalyticsData error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, refetch: fetchData };
};
