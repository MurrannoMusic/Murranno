import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Track {
    id: string;
    title: string;
    duration: number;
    track_number: number;
    isrc: string | null;
    streams: number;
    audio_url?: string | null;
}

export interface ReleaseDetail {
    id: string;
    title: string;
    artist_name: string;
    release_type: string;
    release_date: string;
    cover_art_url: string | null;
    status: string;
    genre: string | null;
    language: string | null;
    label: string | null;
    copyright: string | null;
    upc_ean: string | null;
    isrc: string | null;
    recording_year: string | null;
    smartlink: string | null;
    tracks: Track[];
    total_streams: number;
    total_earnings: number;
}

export const useReleaseDetail = (releaseId: string | undefined) => {
    const [release, setRelease] = useState<ReleaseDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (releaseId) fetchDetail();
    }, [releaseId]);

    const fetchDetail = async () => {
        if (!releaseId) return;
        try {
            setLoading(true);
            const { data, error } = await supabase.functions.invoke('get-release-detail', {
                body: { releaseId },
            });
            if (error) throw error;
            if (data?.success) setRelease(data.release);
        } catch (err) {
            console.error('useReleaseDetail error:', err);
        } finally {
            setLoading(false);
        }
    };

    return { release, loading, refetch: fetchDetail };
};
