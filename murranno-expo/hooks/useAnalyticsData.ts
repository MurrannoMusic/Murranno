import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
export interface AnalyticsSummary {
  totalStreams: number;
  streamsByPlatform: Record<string, number>;
  streamsByCountry: Record<string, number>;
  bestPlatform: { name: string; streams: number } | null;
  topCountry: { name: string; streams: number } | null;
  mostStreamedTrack: { title: string; release: string; streams: number } | null;
  dateRange: string;
}
export const useAnalyticsData = (period = 7) => {
    const [data, setData] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revision, setRevision] = useState(0);
    const refetch = useCallback(() => setRevision(n => n + 1), []);
    useEffect(() => {
        let active = true;
        setLoading(true); setError(null); setData(null);
        supabase.functions.invoke('get-analytics-data', { body: { period } }).then(({ data: res, error: requestError }) => {
            if (requestError) throw requestError;
            if (!res?.success) throw new Error(res?.error || 'Analytics unavailable');
            const end = new Date();
            const start = new Date(); start.setDate(start.getDate() - period + 1);
            const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
            if (active) setData({ streamsByPlatform: res.streamsByPlatform || {}, streamsByCountry: res.streamsByCountry || {}, totalStreams: res.totalStreams || 0, bestPlatform: res.bestPlatform || null, topCountry: res.topCountry || null, mostStreamedTrack: res.topTracks?.length ? { title: res.topTracks[0].title, release: res.topTracks[0].release, streams: res.topTracks[0].streams } : null, dateRange: `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}` });
        }).catch(() => { if (active) setError('Analytics reports could not be loaded.'); }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [period, revision]);
    return { data, loading, error, refetch };
};
