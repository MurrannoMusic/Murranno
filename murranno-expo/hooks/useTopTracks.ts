import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TopTrack {
  id: string;
  name: string;
  plays: string;
  rawPlays: number;
  change: string;
  changeType: 'positive' | 'negative';
}

export const useTopTracks = () => {
  const [tracks, setTracks] = useState<TopTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-analytics-data', {
        body: { period: 30 },
      });
      if (error) throw error;

      const raw: any[] = data?.topTracks || [];
      const maxPlays = raw[0]?.streams || 1;

      setTracks(
        raw.slice(0, 5).map((t: any) => ({
          id: t.id,
          name: t.title,
          rawPlays: t.streams,
          plays: t.streams >= 1000
            ? `${(t.streams / 1000).toFixed(1)}K`
            : t.streams.toString(),
          change: `${Math.round((t.streams / maxPlays) * 100)}%`,
          changeType: 'positive',
        }))
      );
    } catch (err) {
      console.error('useTopTracks error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { tracks, loading, refetch: fetchTracks };
};
