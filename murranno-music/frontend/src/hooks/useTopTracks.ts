import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
export interface TopTrack { id: string; name: string; plays: string; rawPlays: number; coverArtUrl: string | null; release: string; }
export const useTopTracks = (period = 30) => {
    const [tracks, setTracks] = useState<TopTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revision, setRevision] = useState(0);
    useEffect(() => {
        let active = true;
        setLoading(true); setError(null); setTracks([]);
        supabase.functions.invoke('get-analytics-data', { body: { period } }).then(({ data, error: requestError }) => {
            if (requestError) throw requestError;
            if (!data?.success) throw new Error('Analytics unavailable');
            if (active) setTracks((data.topTracks || []).slice(0, 5).map((t: any) => ({ id: t.id, name: t.title, rawPlays: t.streams || 0, plays: (t.streams || 0).toLocaleString(), coverArtUrl: t.cover_art_url || t.coverArtUrl || null, release: t.release || '' })));
        }).catch(() => { if (active) setError('Top tracks could not be loaded.'); }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [period, revision]);
    return { tracks, loading, error, refetch: () => setRevision(n => n + 1) };
};
