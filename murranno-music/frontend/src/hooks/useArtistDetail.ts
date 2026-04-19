import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ArtistDetail {
  id: string;
  stage_name: string;
  bio: string | null;
  profile_image: string | null;
  user_id: string | null;
  totalStreams: number;
  totalEarnings: number;
  releaseCount: number;
  spotify_url: string | null;
  apple_music_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
}

export interface ReleaseWithStats {
  id: string;
  title: string;
  cover_art_url: string | null;
  release_date: string;
  status: string;
  streams: number;
  earnings: number;
}

export interface PayoutHistory {
  date: string;
  amount: string;
  status: string;
  period: string;
}

export const useArtistDetail = (artistId: string) => {
  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [releases, setReleases] = useState<ReleaseWithStats[]>([]);
  const [labelRelation, setLabelRelation] = useState<any>(null);
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (artistId) {
      fetchArtistDetail();
    }
  }, [artistId]);

  const fetchArtistDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-artist-detail', {
        body: { artistId }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch artist details');
      }

      setArtist(data.artist);
      setReleases(data.releases || []);
      setLabelRelation(data.labelRelation);
      setPayoutHistory(data.payoutHistory || []);
    } catch (error: any) {
      console.error('Error fetching artist detail:', error);
      toast.error('Failed to load artist details');
    } finally {
      setLoading(false);
    }
  };

  return {
    artist,
    releases,
    labelRelation,
    payoutHistory,
    loading,
    refetch: fetchArtistDetail,
  };
};
