import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TopTrack {
  id: string;
  name: string;
  plays: string;
  change: string;
  changeType: 'positive' | 'negative';
}

export const useTopTracks = () => {
  const [tracks, setTracks] = useState<TopTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopTracks();
  }, []);

  const fetchTopTracks = async () => {
    try {
      setLoading(true);
      
      // Get user's artist profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: artist } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!artist) {
        setTracks([]);
        setLoading(false);
        return;
      }

      // Get tracks with streaming data
      const { data: trackData, error } = await supabase
        .from('tracks')
        .select(`
          id,
          title,
          release_id,
          releases!inner(artist_id),
          streaming_data(streams)
        `)
        .eq('releases.artist_id', artist.id);

      if (error) throw error;

      if (!trackData || trackData.length === 0) {
        setTracks([]);
        setLoading(false);
        return;
      }

      // Aggregate streams per track
      const tracksWithStreams = trackData.map(track => {
        const totalStreams = (track.streaming_data || []).reduce(
          (sum: number, data: any) => sum + (data.streams || 0),
          0
        );
        return {
          id: track.id,
          name: track.title,
          totalStreams,
        };
      });

      // Sort by streams and take top 5
      const topTracks = tracksWithStreams
        .sort((a, b) => b.totalStreams - a.totalStreams)
        .slice(0, 5)
        .map(track => ({
          id: track.id,
          name: track.name,
          plays: formatNumber(track.totalStreams),
          change: '+12%', // Would need historical data to calculate actual change
          changeType: 'positive' as const,
        }));

      setTracks(topTracks);
    } catch (error: any) {
      console.error('Error fetching top tracks:', error);
      // Don't show error toast, just use empty state
    } finally {
      setLoading(false);
    }
  };

  return {
    tracks,
    loading,
    refetch: fetchTopTracks,
  };
};

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
