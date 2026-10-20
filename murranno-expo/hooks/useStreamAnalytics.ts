import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
export interface StreamDataPoint { label: string; streams: number; date: string; }
export interface StreamStats { currentTotal: number; currentDateRange: string; percentageChange: number | null; }

export const useStreamAnalytics = (periodDays = 7) => {
    const [chartData, setChartData] = useState<StreamDataPoint[]>([]);
    const [stats, setStats] = useState<StreamStats>({ currentTotal: 0, currentDateRange: '', percentageChange: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revision, setRevision] = useState(0);
    const refetch = useCallback(() => setRevision(n => n + 1), []);
    useEffect(() => {
        let active = true;
        const run = async () => {
            setLoading(true); setError(null); setChartData([]);
            const end = new Date();
            end.setUTCHours(0, 0, 0, 0);
            const start = new Date(end); start.setUTCDate(start.getUTCDate() - periodDays + 1);
            const previous = new Date(start); previous.setUTCDate(previous.getUTCDate() - periodDays);
            const dateKey = (d: Date) => d.toISOString().slice(0, 10);
            const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
            const range = `${fmt(start)} – ${fmt(end)}, ${end.getUTCFullYear()}`;
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;
                if (!user) { if (active) setStats({ currentTotal: 0, currentDateRange: range, percentageChange: null }); return; }
                const { data: artist, error: artistError } = await supabase.from('artists').select('id').eq('user_id', user.id).maybeSingle();
                if (artistError) throw artistError;
                if (!artist) { if (active) setStats({ currentTotal: 0, currentDateRange: range, percentageChange: null }); return; }
                const { data, error: queryError } = await supabase.from('streaming_data').select('date, streams, tracks!inner(release_id, releases!inner(artist_id))').eq('tracks.releases.artist_id', artist.id).gte('date', dateKey(previous)).lte('date', dateKey(end)).order('date', { ascending: true });
                if (queryError) throw queryError;
                const grouped: Record<string, number> = {};
                let previousTotal = 0;
                for (const row of data || []) {
                    const date = row.date.slice(0, 10);
                    if (date < dateKey(start)) previousTotal += row.streams;
                    else grouped[date] = (grouped[date] || 0) + row.streams;
                }
                const points = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, streams]) => ({ date, streams, label: fmt(new Date(`${date}T00:00:00Z`)) }));
                const currentTotal = points.reduce((sum, p) => sum + p.streams, 0);
                if (active) {
                    setChartData(points);
                    setStats({ currentTotal, currentDateRange: range, percentageChange: previousTotal > 0 ? Math.round((currentTotal - previousTotal) / previousTotal * 1000) / 10 : null });
                }
            } catch (err) {
                console.error('useStreamAnalytics error:', err);
                if (active) setError('Stream reports could not be loaded.');
            } finally { if (active) setLoading(false); }
        };
        run();
        return () => { active = false; };
    }, [periodDays, revision]);
    return { chartData, stats, loading, error, refetch };
};
