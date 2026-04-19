import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsFilters, StreamData, AnalyticsStats } from '@/types/analytics';
import { toast } from 'sonner';

export const useAnalytics = () => {
  const [activeTab, setActiveTab] = useState('streams');
  const [activePeriod, setActivePeriod] = useState('week');
  const [filters, setFilters] = useState<AnalyticsFilters>({
    label: null,
    artist: null,
    release: null,
    track: null,
    country: null,
    store: null,
  });
  const [chartData, setChartData] = useState<StreamData[]>([]);
  const [stats, setStats] = useState<AnalyticsStats>({
    currentTotal: 0,
    currentDateRange: '',
    previousTotal: 0,
    previousDateRange: '',
    percentageChange: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [activePeriod, filters]);

  const getPeriodDays = (): number => {
    switch (activePeriod) {
      case 'week': return 7;
      case 'month': return 30;
      case '90days': return 90;
      case 'year': return 365;
      default: return 7;
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const period = getPeriodDays();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: artist } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!artist) {
        setLoading(false);
        return;
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // Fetch streaming data
      const { data: streamingData, error } = await supabase
        .from('streaming_data')
        .select(`
          date,
          streams,
          platform,
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
      const groupedData: { [key: string]: number } = {};
      streamingData?.forEach(item => {
        const date = item.date;
        if (!groupedData[date]) groupedData[date] = 0;
        groupedData[date] += item.streams;
      });

      const transformedChartData: StreamData[] = Object.entries(groupedData).map(([date, streams]) => ({
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        current: streams,
        previous: 0,
        date
      }));

      setChartData(transformedChartData);

      // Calculate stats
      const currentTotal = transformedChartData.reduce((sum, d) => sum + d.current, 0);
      const dateRange = `${startDate.toLocaleDateString()} - ${new Date().toLocaleDateString()}`;

      setStats({
        currentTotal,
        currentDateRange: dateRange,
        previousTotal: 0,
        previousDateRange: '',
        percentageChange: 0,
      });

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      label: null,
      artist: null,
      release: null,
      track: null,
      country: null,
      store: null,
    });
  };

  return {
    activeTab,
    setActiveTab,
    activePeriod,
    setActivePeriod,
    filters,
    setFilters,
    resetFilters,
    chartData,
    stats,
    loading,
    refetch: fetchAnalyticsData,
  };
};
