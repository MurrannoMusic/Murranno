import { ChevronRight, Music2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Release } from '@/types/release';
import { cn } from '@/lib/utils';

export function ReleaseRow({ release }: { release: Release }) {
  const status = release.status || 'Draft';
  const tint = /^(live|published|approved)$/i.test(status)
    ? 'text-success'
    : /pending|review|processing/i.test(status)
      ? 'text-warning'
      : /reject|fail/i.test(status)
        ? 'text-destructive'
        : 'text-muted-foreground';
  const date = release.releaseDate ? new Date(release.releaseDate) : null;
  const dateLabel = date && !isNaN(date.getTime()) ? date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date set';
  const art = release.coverArt && !release.coverArt.endsWith('placeholder.svg') ? release.coverArt : null;

  return (
    <Link
      to={`/app/releases/${release.id}`}
      className="flex items-center gap-3.5 py-4 border-b border-border hover:bg-secondary/40 -mx-2 px-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {art ? (
        <img src={art} alt="" loading="lazy" className="h-[60px] w-[60px] rounded-md object-cover" />
      ) : (
        <div className="h-[60px] w-[60px] rounded-md bg-secondary grid place-items-center">
          <Music2 className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-base font-semibold truncate">{release.title}</p>
        <p className="text-xs text-muted-foreground truncate">{release.type || 'Release'} · {dateLabel}</p>
        <p className={cn('text-xs font-medium', tint)}>{status}</p>
      </div>
      <ChevronRight className="h-[18px] w-[18px] text-muted-foreground" />
    </Link>
  );
}
