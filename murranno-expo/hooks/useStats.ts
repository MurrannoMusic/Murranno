import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/integrations/supabase/client';

export interface StatsSummary {
  totalStreams: number;
  totalEarnings: number;
  monthlyGrowth: number;
  activeReleases: number;
}

export const useStats = () => {
  const [stats, setStats] = useState<StatsSummary>({
    totalStreams: 0,
    totalEarnings: 0,
    monthlyGrowth: 0,
    activeReleases: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const { data: analyticsData, error: analyticsError } = await supabase.functions.invoke('get-analytics-data', {
        body: { period: 30 }
      });

      if (analyticsError) throw analyticsError;

      const { data: walletData, error: walletError } = await supabase.functions.invoke('get-wallet-balance');

      if (walletError) throw walletError;

      const { data: releasesData, error: releasesError } = await supabase.functions.invoke('get-user-releases');

      if (releasesError) throw releasesError;

      const activeReleases = releasesData?.releases?.filter(
        (r: any) => r.status === 'Published' || r.status === 'Live'
      ).length || 0;

      setStats({
        totalStreams: analyticsData?.totalStreams || 0,
        totalEarnings: walletData?.balance?.total_earnings || 0,
        monthlyGrowth: 0,
        activeReleases,
      });

    } catch (error: any) {
      console.error('Error fetching stats:', error);
      Alert.alert('Error', 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const getStatsAsItems = () => {
    return [
      {
        title: 'Total Streams',
        value: stats.totalStreams.toLocaleString(),
        change: stats.monthlyGrowth ? `${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth}%` : '0%',
        changeType: stats.monthlyGrowth >= 0 ? 'positive' : 'negative'
      },
      {
        title: 'Earnings',
        value: `₦${stats.totalEarnings.toLocaleString()}`,
        change: '0%',
        changeType: 'neutral'
      },
      {
        title: 'Active Releases',
        value: stats.activeReleases.toString(),
        change: '0',
        changeType: 'neutral'
      },
    ];
  };

  return {
    stats,
    loading,
    refetch: fetchStats,
    getStatsAsItems,
  };
};
