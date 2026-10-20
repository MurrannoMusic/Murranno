import { Link } from 'react-router-dom';
import { Music2, Plus, Search } from 'lucide-react';
import { useReleases } from '@/hooks/useReleases';
import { ReleaseRow } from '@/components/dashboard/ReleaseRow';
import { PageTitle } from '@/components/layout/PagePrimitives';
import { cn } from '@/lib/utils';
import { EmptyState, ErrorState, ListSkeleton, NoResults } from '@/components/states/StateViews';
import type { ReleaseStatus } from '@/types/release';

const Releases = () => {
  const { releases, allReleases, searchQuery, setSearchQuery, statusFilter, setStatusFilter, getStatusCount, loading, error, refetch } = useReleases();
  const filters = ['All', ...new Set(allReleases.map((r) => r.status || 'Draft'))] as (ReleaseStatus | 'All')[];

  return (
    <div className="px-6 pb-10 space-y-3.5">
      <PageTitle
        action={
          <Link
            to="/app/upload"
            aria-label="New release"
            className="h-11 w-11 rounded-[10px] bg-primary text-primary-foreground grid place-items-center transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Plus className="h-5 w-5" />
          </Link>
        }
      >
        Your music
      </PageTitle>

      <label className="flex items-center gap-2 rounded-[14px] border border-border bg-secondary/60 px-3 py-2.5 focus-within:ring-2 focus-within:ring-ring">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
        <span className="sr-only">Search releases</span>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search releases…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      <div role="group" aria-label="Filter by status" className="flex gap-1.5 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={statusFilter === f}
            onClick={() => setStatusFilter(f)}
            className={cn(
              'px-3.5 py-3 rounded-xl border border-border text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              statusFilter === f ? 'bg-secondary text-primary' : 'bg-secondary/40 hover:bg-secondary',
            )}
          >
            {f === 'All' ? 'All' : `${f} (${getStatusCount(f)})`}
          </button>
        ))}
      </div>

      <h2 className="text-lg font-semibold">Your releases</h2>
      {loading ? (
        <ListSkeleton rows={5} />
      ) : error ? (
        <ErrorState error={error} title="Couldn’t load your releases" onRetry={refetch} />
      ) : allReleases.length === 0 ? (
        <EmptyState icon={Music2} title="No releases yet" body="Upload your first single, EP or album and we’ll send it to 150+ stores." action={{ label: 'Create a release', to: '/app/upload' }} />
      ) : releases.length === 0 ? (
        <NoResults what="releases" query={searchQuery.trim() || undefined} onClear={() => { setSearchQuery(''); setStatusFilter('All'); }} />
      ) : (
        <div>{releases.map((r) => <ReleaseRow key={r.id} release={r} />)}</div>
      )}
    </div>
  );
};

export default Releases;
