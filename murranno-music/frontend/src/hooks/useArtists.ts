import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ArtistWithStats {
  id: string;
  stage_name: string;
  profile_image: string | null;
  status: string;
  releases: number;
  streams: string;
  revenue: string;
}

export const useArtists = () => {
  const [artists, setArtists] = useState<ArtistWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-label-artists');

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch artists');
      }

      setArtists(data.artists || []);
    } catch (error: any) {
      console.error('Error fetching artists:', error);
      toast.error('Failed to load artists');
    } finally {
      setLoading(false);
    }
  };

  return {
    artists,
    loading,
    refetch: fetchArtists,
  };
};
