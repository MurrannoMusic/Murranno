import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TopTrack {
  id: string;
  title: string;
  artist: string;
  streams: number;
  release: string;
}

interface PlatformData {
  platform: string;
  streams: number;
  percentage: number;
}

interface CountryData {
  country: string;
  streams: number;
  percentage: number;
}

interface EarningsData {
  date: string;
  amount: number;
}

interface ActivityData {
  date: string;
  type: string;
  description: string;
  track: string;
  platform: string;
}

export interface AnalyticsData {
  totalStreams: number;
  totalEarnings: number;
  activeReleases: number;
  topTracks: TopTrack[];
  streamsByPlatform: PlatformData[];
  streamsByCountry: CountryData[];
  earningsOverTime: EarningsData[];
  recentActivity: ActivityData[];
  bestPlatform?: { name: string; streams: number } | null;
  topCountry?: { name: string; streams: number } | null;
}

export const useAnalyticsData = (period: string = '30', artistId?: string) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('Not authenticated');
        }

        const { data: analyticsData, error: fetchError } = await supabase.functions.invoke(
          'get-analytics-data',
          {
            body: { 
              period,
              artistId 
            }
          }
        );

        if (fetchError) throw fetchError;

        if (!analyticsData?.success) {
          throw new Error(analyticsData?.error || 'Failed to fetch analytics');
        }

        // Transform the data to match the expected format
        const transformedData: AnalyticsData = {
          totalStreams: analyticsData.totalStreams || 0,
          totalEarnings: analyticsData.totalEarnings || 0,
          activeReleases: 0,
          topTracks: analyticsData.topTracks || [],
          streamsByPlatform: Object.entries(analyticsData.streamsByPlatform || {}).map(([platform, streams]) => ({
            platform,
            streams: streams as number,
            percentage: ((streams as number) / (analyticsData.totalStreams || 1)) * 100
          })),
          streamsByCountry: Object.entries(analyticsData.streamsByCountry || {}).map(([country, streams]) => ({
            country,
            streams: streams as number,
            percentage: ((streams as number) / (analyticsData.totalStreams || 1)) * 100
          })),
          earningsOverTime: Object.entries(analyticsData.streamsByDate || {}).map(([date, amount]) => ({
            date,
            amount: amount as number
          })),
          recentActivity: [],
          bestPlatform: analyticsData.bestPlatform,
          topCountry: analyticsData.topCountry
        };

        setData(transformedData);
      } catch (err: any) {
        console.error('Analytics fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period, artistId]);

  const refetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    // Trigger re-fetch by updating state
    setLoading(true);
  };

  return { data, loading, error, refetch };
};
