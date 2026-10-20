import {errorMessage} from '@/lib/api';
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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (releaseId) fetchDetail(); else setLoading(false);
    }, [releaseId]);

    const fetchDetail = async () => {
        if (!releaseId) return;
        try {
            setLoading(true); setError(null);
            const { data, error } = await supabase.functions.invoke('get-release-detail', {
                body: { releaseId },
            });
            if (error) throw error;
            if (data?.success) setRelease({ ...data.release, tracks: (data.release.tracks || []).map((t: any) => ({ ...t, audio_url: t.audio_url || t.audioFileUrl || t.audio_file_url || null })) });
        } catch (err) {
            setError(await errorMessage(err));
            console.error('useReleaseDetail error:', err);
        } finally {
            setLoading(false);
        }
    };

    return { release, loading, error, refetch: fetchDetail };
};
