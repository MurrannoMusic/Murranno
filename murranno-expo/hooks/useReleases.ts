import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Release {
  id: string;
  title: string;
  releaseType: string;
  releaseDate: string;
  status: string;
  coverArtUrl: string | null;
  genre: string | null;
}

export const useReleases = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-user-releases');
      if (error) throw error;
      if (data?.success) {
        setReleases(
          (data.releases || []).map((r: any) => ({
            id: r.id,
            title: r.title,
            releaseType: r.release_type || r.releaseType,
            releaseDate: r.release_date || r.releaseDate,
            status: r.status,
            coverArtUrl: r.cover_art_url || r.coverArtUrl || null,
            genre: r.genre || null,
          }))
        );
      }
    } catch (err) {
      console.error('useReleases error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { releases, loading, refetch: fetchReleases };
};
