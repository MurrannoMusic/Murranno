import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {errorMessage} from '@/lib/api';
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
  const [error, setError] = useState<string | null>(null);



  const fetchReleases = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const { data, error } = await supabase.functions.invoke('get-user-releases');
      if (error) throw error;
      if (data?.success) {
        setReleases(
          (data.releases || []).map((r: any) => ({
            id: r.id,
            title: r.title,
            releaseType: r.release_type || r.releaseType || r.type,
            releaseDate: r.release_date || r.releaseDate,
            status: r.status,
            coverArtUrl: r.cover_art_url || r.coverArtUrl || (r.coverArt?.startsWith('http') ? r.coverArt : null),
            genre: r.genre || r.metadata?.genre || null,
          }))
        );
      }
    } catch (err) {
      setError(await errorMessage(err));
      console.error('useReleases error:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { void fetchReleases(); }, [fetchReleases]));

  return { releases, loading, error, refetch: fetchReleases };
};
