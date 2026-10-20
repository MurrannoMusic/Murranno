import { useState } from 'react';
import { Music2 } from 'lucide-react';
import { useStreamAnalytics } from '@/hooks/useStreamAnalytics';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useTopTracks } from '@/hooks/useTopTracks';
import { StreamChart } from '@/components/dashboard/StreamChart';
import { PageTitle, Segmented, SectionTitle, UnderlineTabs } from '@/components/layout/PagePrimitives';
import { cn } from '@/lib/utils';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/states/StateViews';

const TABS = ['Streams', 'Tracks', 'Stores', 'Audience'] as const;
const PERIODS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: 'Year', value: 365 },
] as const;

const Retry = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <ErrorState error={new Error(message)} title="Couldn’t load your analytics" onRetry={onRetry} className="py-6" />
);

function TopTracks({ period }: { period: number }) {
  const { tracks, loading, error, refetch } = useTopTracks(period);
  return (
    <section aria-labelledby="top-tracks">
      <div className="flex items-center justify-between mb-2">
        <h2 id="top-tracks" className="text-[21px] font-semibold tracking-tight">Top tracks</h2>
        <span className="text-xs text-muted-foreground">Streams</span>
      </div>
      {loading ? (
        <ListSkeleton rows={5} />
      ) : error ? (
        <Retry message={error} onRetry={refetch} />
      ) : !tracks.length ? (
        <EmptyState icon={Music2} title="No streams reported yet" body="Your most streamed tracks show up here once stores send their first reports, usually a few days after release." />
      ) : (
        <ol>
          {tracks.map((t, i) => (
            <li key={t.id} className="flex items-center gap-3 py-4 border-b border-border">
              <span className="w-5 text-xs text-muted-foreground tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              {t.coverArtUrl ? (
                <img src={t.coverArtUrl} alt="" loading="lazy" className="h-11 w-11 rounded object-cover" />
              ) : (
                <span className="h-11 w-11 rounded bg-secondary grid place-items-center"><Music2 className="h-[18px] w-[18px] text-muted-foreground" /></span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium truncate">{t.name}</p>
                {t.release && <p className="text-xs text-muted-foreground truncate">{t.release}</p>}
              </div>
              <span className="text-[15px] font-semibold tabular-nums">{t.plays}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Breakdown({ tab, days }: { tab: 'Stores' | 'Audience'; days: number }) {
  const { data, loading, error, refetch } = useAnalyticsData(String(days));
  const rows = (tab === 'Stores'
    ? (data?.streamsByPlatform ?? []).map((r) => [r.platform, r.streams] as const)
    : (data?.streamsByCountry ?? []).map((r) => [r.country, r.streams] as const)
  ).slice().sort((a, b) => b[1] - a[1]);
  const total = Math.max(1, data?.totalStreams ?? 0);
  if (error) return <Retry message={error} onRetry={refetch} />;
  return (
    <section className="py-3 space-y-3">
      <SectionTitle>{tab === 'Stores' ? 'Streams by store' : 'Streams by country'}</SectionTitle>
      {loading ? (
        <ListSkeleton rows={4} media={false} />
      ) : !rows.length ? (
        <EmptyState title="No reports for this period" body="Try a longer period, or check back once stores send new reports." />
      ) : (
        <ul className="space-y-1">
          {rows.map(([name, streams]) => (
            <li key={name} className="py-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span>{name}</span>
                <span className="text-muted-foreground tabular-nums">{streams.toLocaleString()}</span>
              </div>
              <div className="h-1 rounded-full bg-border">
                <div className="h-1 rounded-full bg-primary" style={{ width: `${Math.min(100, (streams / total) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export const Analytics = () => {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Streams');
  const [days, setDays] = useState<number>(30);
  const { chartData, stats, loading, error, refetch } = useStreamAnalytics(days);
  const change = stats.percentageChange;

  return (
    <div className="px-6 pb-10 space-y-6">
      <PageTitle>Analytics</PageTitle>
      <UnderlineTabs<(typeof TABS)[number]> tabs={TABS} value={tab} onChange={setTab} label="Analytics sections" />
      <Segmented<number> options={PERIODS} value={days} onChange={setDays} label="Reporting period" />
      <p className="text-xs text-muted-foreground">{loading ? 'Loading reporting period…' : stats.currentDateRange}</p>

      {tab === 'Streams' ? (
        error ? (
          <Retry message={error} onRetry={refetch} />
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total reported streams</p>
              <p className="text-[44px] font-semibold tracking-tight tabular-nums leading-none">{loading ? '—' : stats.currentTotal.toLocaleString()}</p>
              {!loading && (
                <p className={cn('text-[13px]', change === null ? 'text-muted-foreground' : change >= 0 ? 'text-success' : 'text-destructive')}>
                  {change === null ? 'No previous-period comparison available' : `${change >= 0 ? '↗ +' : '↘ '}${change}% vs previous ${days} days`}
                </p>
              )}
            </div>
            <section aria-labelledby="daily-streams">
              <h2 id="daily-streams" className="text-xl font-semibold tracking-tight mb-3">Daily streams</h2>
              <StreamChart data={chartData} loading={loading} />
              <p className="text-[11px] text-muted-foreground mt-3">Reported days only. Reporting times vary by store.</p>
            </section>
            <div className="border-t border-border pt-6">
              <TopTracks period={days} />
            </div>
          </>
        )
      ) : tab === 'Tracks' ? (
        <TopTracks period={days} />
      ) : (
        <Breakdown tab={tab} days={days} />
      )}
    </div>
  );
};
