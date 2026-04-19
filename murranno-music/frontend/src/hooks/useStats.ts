import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

      // Fetch analytics data for stats
      const { data: analyticsData, error: analyticsError } = await supabase.functions.invoke('get-analytics-data', {
        body: { period: 30 }
      });

      if (analyticsError) throw analyticsError;

      // Fetch wallet balance
      const { data: walletData, error: walletError } = await supabase.functions.invoke('get-wallet-balance');

      if (walletError) throw walletError;

      // Fetch releases to count active ones
      const { data: releasesData, error: releasesError } = await supabase.functions.invoke('get-user-releases');

      if (releasesError) throw releasesError;

      const activeReleases = releasesData?.releases?.filter(
        (r: any) => r.status === 'Published' || r.status === 'Live'
      ).length || 0;

      setStats({
        totalStreams: analyticsData?.totalStreams || 0,
        totalEarnings: walletData?.balance?.total_earnings || 0,
        monthlyGrowth: 0, // Would need historical data to calculate this
        activeReleases,
      });

    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
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
        change: '0%', // Placeholder until historical data is available
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
