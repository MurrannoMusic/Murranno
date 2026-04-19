import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StreamDataPoint {
  label: string;
  streams: number;
  date: string;
}

export interface StreamStats {
  currentTotal: number;
  currentDateRange: string;
  percentageChange: number;
}

export const useStreamAnalytics = (periodDays: number = 7) => {
  const [chartData, setChartData] = useState<StreamDataPoint[]>([]);
  const [stats, setStats] = useState<StreamStats>({
    currentTotal: 0,
    currentDateRange: '',
    percentageChange: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: artist } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!artist) return;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const { data: streamingData, error } = await supabase
        .from('streaming_data')
        .select(`
          date,
          streams,
          tracks!inner(
            release_id,
            releases!inner(artist_id)
          )
        `)
        .eq('tracks.releases.artist_id', artist.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      // Group by date
      const grouped: Record<string, number> = {};
      streamingData?.forEach((item) => {
        if (!grouped[item.date]) grouped[item.date] = 0;
        grouped[item.date] += item.streams;
      });

      const points: StreamDataPoint[] = Object.entries(grouped).map(([date, streams]) => ({
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        streams,
        date,
      }));

      setChartData(points);

      const total = points.reduce((sum, p) => sum + p.streams, 0);
      const end = new Date();
      const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      setStats({
        currentTotal: total,
        currentDateRange: `${fmt(startDate)} – ${fmt(end)}, ${end.getFullYear()}`,
        percentageChange: 0,
      });
    } catch (err) {
      console.error('useStreamAnalytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [periodDays]);

  return { chartData, stats, loading, refetch: fetchData };
};
