import { Link } from 'react-router-dom';
import { ChevronRight, Clock, DollarSign, Info, Music2, Play, Plus, ShieldAlert, Upload } from 'lucide-react';
import { useUserType } from '@/hooks/useUserType';
import { useStats } from '@/hooks/useStats';
import { useReleases } from '@/hooks/useReleases';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { useStreamAnalytics } from '@/hooks/useStreamAnalytics';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { StreamChart } from '@/components/dashboard/StreamChart';
import { ReleaseRow } from '@/components/dashboard/ReleaseRow';
import { cn } from '@/lib/utils';
import { ChartSkeleton, EmptyState, ErrorState, ListSkeleton, StatSkeleton } from '@/components/states/StateViews';

const KYC_COPY = {
  unverified: { label: 'Verification required', sub: 'Verify your ID to enable music distribution', tone: 'warning', Icon: ShieldAlert },
  pending: { label: 'Verification pending', sub: 'We are reviewing your documents', tone: 'primary', Icon: Clock },
  rejected: { label: 'Verification failed', sub: 'Please re-submit your documents', tone: 'destructive', Icon: ShieldAlert },
} as const;
const TONE = {
  warning: 'text-warning border-warning/30 bg-warning/10',
  primary: 'text-primary border-primary/30 bg-primary/10',
  destructive: 'text-destructive border-destructive/30 bg-destructive/10',
};
const ACTIVITY_ICON = { upload: Upload, dollar: DollarSign, play: Play };

function KycBanner() {
  const { profile } = useAuth();
  if (!profile || profile.kyc_status === 'verified') return null;
  const c = KYC_COPY[profile.kyc_status] ?? KYC_COPY.unverified;
  return (
    <Link to="/app/kyc" className={cn('flex items-center gap-3 rounded-lg border p-3 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', TONE[c.tone])}>
      <c.Icon className="h-5 w-5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold">{c.label}</p>
        <p className="text-xs text-muted-foreground truncate">{c.sub}</p>
      </div>
      <ChevronRight className="h-4 w-4" />
    </Link>
  );
}

function ActivityFeed() {
  const { activities, loading } = useRecentActivity();
  return (
    <section aria-labelledby="activity-heading">
      <h2 id="activity-heading" className="text-[21px] font-semibold tracking-tight mb-3">Recent activity</h2>
      {loading ? (
        <ListSkeleton rows={3} media={false} />
      ) : activities.length === 0 ? (
        <EmptyState icon={Clock} title="No activity yet" body="Releases, earnings and campaign updates will show up here." className="py-6" />
      ) : (
        <ul>
          {activities.map((item) => {
            const Icon = ACTIVITY_ICON[item.icon] ?? Info;
            return (
              <li key={item.id} className="flex items-center gap-3 py-4 border-b border-border">
                <span className="h-9 w-9 rounded-full bg-secondary grid place-items-center">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">{item.time}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export const Dashboard = () => {
  const { currentUser, loading: userLoading } = useUserType();
  const { stats, loading, error: statsError, refetch: refetchStats } = useStats();
  const { releases, loading: releasesLoading, error: releasesError, refetch: refetchReleases } = useReleases();
  const { profile } = useArtistProfile();
  const { chartData, loading: chartLoading, error, refetch } = useStreamAnalytics(30);
  const { formatAmount } = useCurrency();

  if (userLoading || !currentUser) {
    return <div className="px-6 py-8 text-center text-sm text-muted-foreground">{userLoading ? 'Loading…' : 'Redirecting…'}</div>;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.stage_name?.split(' ')[0];
  const metrics = [
    { label: 'Streams', value: stats.totalStreams.toLocaleString(), sub: 'Across all releases' },
    { label: 'Earnings', value: formatAmount(stats.totalEarnings), sub: 'Lifetime reported royalties' },
  ];

  return (
    <div className="px-6 pb-10 space-y-6">
      <header className="space-y-1.5">
        <p className="text-sm text-muted-foreground">{greeting}{firstName ? `, ${firstName}` : ''}</p>
        <h1 className="text-[32px] font-bold tracking-tight leading-tight">Overview</h1>
      </header>

      <KycBanner />

      <p className="text-[13px] text-muted-foreground">Streams · Last 30 days</p>
      {loading ? <StatSkeleton /> : statsError ? <ErrorState error={statsError} title="Couldn’t load your stats" onRetry={refetchStats} className="py-6" /> : (
      <dl className="grid grid-cols-2 gap-4">
        {metrics.map((m, i) => (
          <div key={m.label} className={cn('space-y-2 min-w-0', i === 1 && 'border-l border-border pl-5')}>
            <dt className="text-sm text-muted-foreground">{m.label}</dt>
            <dd className="text-[28px] font-semibold tracking-tight tabular-nums truncate">{m.value}</dd>
            <dd className="text-[11px] text-muted-foreground">{m.sub}</dd>
          </div>
        ))}
      </dl>
      )}

      {error ? (
        <button type="button" onClick={refetch} className="text-sm text-destructive hover:underline">{error} Try again.</button>
      ) : (
        chartLoading ? <ChartSkeleton /> : <StreamChart data={chartData} />
      )}

      <Link
        to="/app/upload"
        className="flex items-center justify-center gap-2.5 min-h-[52px] rounded-[10px] bg-primary text-primary-foreground text-base font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Plus className="h-5 w-5" /> New release
      </Link>

      <section aria-labelledby="releases-heading">
        <div className="flex items-center justify-between">
          <h2 id="releases-heading" className="text-[21px] font-semibold tracking-tight">Your releases</h2>
          <Link to="/app/releases" className="flex items-center gap-1 min-h-11 text-[13px] font-semibold text-primary hover:underline">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {releasesLoading ? (
          <ListSkeleton rows={3} />
        ) : releasesError ? (
          <ErrorState error={releasesError} title="Couldn’t load your releases" onRetry={refetchReleases} />
        ) : releases.length ? (
          releases.slice(0, 3).map((r) => <ReleaseRow key={r.id} release={r} />)
        ) : (
          <EmptyState icon={Music2} title="Your music starts here" body="Create your first release to send your music to Spotify, Apple Music, Boomplay and 150+ stores." action={{ label: 'Create a release', to: '/app/upload' }} />
        )}
      </section>

      <ActivityFeed />
    </div>
  );
};
