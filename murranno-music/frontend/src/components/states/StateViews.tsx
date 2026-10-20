import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Inbox, Lock, SearchX, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

type Icon = ComponentType<{ className?: string }>;
type Action = { label: string; to?: string; onClick?: () => void };

function ActionButton({ action, variant = 'default' }: { action: Action; variant?: 'default' | 'outline' }) {
  return action.to
    ? <Button asChild variant={variant} className="min-h-11"><Link to={action.to}>{action.label}</Link></Button>
    : <Button variant={variant} className="min-h-11" onClick={action.onClick}>{action.label}</Button>;
}

function StateShell({ icon: IconC, tone = 'muted', title, body, action, secondary, className, children }: {
  icon: Icon; tone?: 'muted' | 'primary' | 'destructive' | 'success' | 'warning'; title: string; body?: ReactNode;
  action?: Action; secondary?: Action; className?: string; children?: ReactNode;
}) {
  const toneClass = { muted: 'bg-secondary text-muted-foreground', primary: 'bg-primary/10 text-primary', destructive: 'bg-destructive/10 text-destructive', success: 'bg-success/10 text-success', warning: 'bg-warning/10 text-warning' }[tone];
  return (
    <div role={tone === 'destructive' ? 'alert' : 'status'} className={cn('flex flex-col items-center text-center gap-3 px-6 py-10', className)}>
      <span className={cn('h-12 w-12 rounded-full grid place-items-center', toneClass)}><IconC className="h-6 w-6" /></span>
      <div className="space-y-1.5 max-w-sm">
        <p className="text-base font-semibold">{title}</p>
        {body && <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>}
      </div>
      {children}
      {(action || secondary) && <div className="flex flex-wrap justify-center gap-2 pt-1">{action && <ActionButton action={action} />}{secondary && <ActionButton action={secondary} variant="outline" />}</div>}
    </div>
  );
}

/** Nothing here yet — say what will appear and how to get started. */
export const EmptyState = ({ icon = Inbox, title, body, action, secondary, className }: { icon?: Icon; title: string; body?: ReactNode; action?: Action; secondary?: Action; className?: string }) =>
  <StateShell icon={icon} title={title} body={body} action={action} secondary={secondary} className={className} />;

/** A search or filter matched nothing. */
export const NoResults = ({ query, onClear, what = 'results' }: { query?: string; onClear?: () => void; what?: string }) =>
  <StateShell icon={SearchX} title={query ? `No ${what} for “${query}”` : `No ${what} match these filters`} body="Check the spelling or try a different search." action={onClear ? { label: 'Clear search', onClick: onClear } : undefined} />;

/** Something failed. Always explain it in plain words and offer a way forward. */
export function ErrorState({ error, title, onRetry, className }: { error?: unknown; title?: string; onRetry?: () => void; className?: string }) {
  const info = friendlyError(error);
  return <StateShell icon={info.kind === 'offline' ? WifiOff : info.kind === 'forbidden' ? Lock : AlertTriangle} tone={info.kind === 'offline' ? 'warning' : 'destructive'}
    title={title ?? info.title} body={info.message} className={className}
    action={onRetry ? { label: 'Try again', onClick: onRetry } : undefined} />;
}

/** The user is signed in but not allowed here; tell them why and what unlocks it. */
export const PermissionDenied = ({ title = 'You don’t have access to this page', body, action = { label: 'Go to dashboard', to: '/app/dashboard' }, secondary }: { title?: string; body?: ReactNode; action?: Action; secondary?: Action }) =>
  <div className="min-h-[60vh] grid place-items-center"><StateShell icon={Lock} tone="warning" title={title} body={body ?? 'Your account doesn’t include this area. If you think this is a mistake, contact support.'} action={action} secondary={secondary ?? { label: 'Contact support', to: '/support' }} /></div>;

/** A flow finished: confirm what happened and what comes next. */
export const SuccessState = ({ title, body, action, secondary, className, children }: { title: string; body?: ReactNode; action?: Action; secondary?: Action; className?: string; children?: ReactNode }) =>
  <StateShell icon={CheckCircle2} tone="success" title={title} body={body} action={action} secondary={secondary} className={className}>{children}</StateShell>;

// ── Skeletons: shaped like the content they stand in for, so the page doesn't jump when data arrives ──
export const ListSkeleton = ({ rows = 4, media = true }: { rows?: number; media?: boolean }) => (
  <div aria-busy="true" aria-label="Loading" className="divide-y divide-border">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex items-center gap-3.5 py-4">
        {media && <Skeleton className="h-[60px] w-[60px] rounded-md" />}
        <div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div>
      </div>
    ))}
  </div>
);
export const StatSkeleton = ({ count = 2 }: { count?: number }) => (
  <div aria-busy="true" aria-label="Loading" className="grid grid-cols-2 gap-4">
    {Array.from({ length: count }, (_, i) => <div key={i} className="space-y-2"><Skeleton className="h-3.5 w-20" /><Skeleton className="h-8 w-28" /><Skeleton className="h-3 w-24" /></div>)}
  </div>
);
export const CardSkeleton = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <div aria-busy="true" aria-label="Loading" className={cn('rounded-xl border border-border bg-card p-5 space-y-3', className)}>
    <Skeleton className="h-5 w-1/3" />{Array.from({ length: lines }, (_, i) => <Skeleton key={i} className={cn('h-3.5', i === lines - 1 ? 'w-1/2' : 'w-full')} />)}
  </div>
);
export const ChartSkeleton = () => <Skeleton aria-busy="true" aria-label="Loading chart" className="h-[200px] w-full rounded-lg" />;

/** Stands in for a table's rows while they load, fail, are empty, or are filtered to nothing. */
export function TableStateRow({ colSpan, loading, error, onRetry, empty, filtered, onClear, rows = 5 }: {
  colSpan: number; loading?: boolean; error?: unknown; onRetry?: () => void;
  empty: { title: string; body?: string; icon?: Icon }; filtered?: boolean; onClear?: () => void; rows?: number;
}) {
  if (loading) {
    return <>{Array.from({ length: rows }, (_, i) => (
      <TableRow key={i} aria-busy="true">
        {Array.from({ length: colSpan }, (_, c) => <TableCell key={c}><Skeleton className={cn('h-4', c === 0 ? 'w-3/4' : 'w-1/2')} /></TableCell>)}
      </TableRow>
    ))}</>;
  }
  const content = error ? <ErrorState error={error} onRetry={onRetry} className="py-8" />
    : filtered ? <StateShell icon={SearchX} title="Nothing matches these filters" body="Try a different search or clear the filters." action={onClear ? { label: 'Clear filters', onClick: onClear } : undefined} className="py-8" />
    : <EmptyState icon={empty.icon} title={empty.title} body={empty.body} className="py-8" />;
  return <TableRow className="hover:bg-transparent"><TableCell colSpan={colSpan}>{content}</TableCell></TableRow>;
}

// ── Error wording ──
export interface FriendlyError { kind: 'offline' | 'timeout' | 'auth' | 'forbidden' | 'notfound' | 'server' | 'validation' | 'unknown'; title: string; message: string }

/** Maps fetch / supabase-js / API errors to words a user can act on. */
export function friendlyError(error: unknown): FriendlyError {
  const e = error as { message?: string; status?: number; code?: string; context?: { status?: number } } | undefined;
  const status = e?.status ?? e?.context?.status;
  const msg = String(e?.message ?? (typeof error === 'string' ? error : ''));
  if (typeof navigator !== 'undefined' && !navigator.onLine) return { kind: 'offline', title: 'You’re offline', message: 'Check your internet connection. We’ll reload this when you’re back online.' };
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(msg)) return { kind: 'offline', title: 'Can’t reach Murranno', message: 'Your connection dropped or is very slow. Check your internet and try again.' };
  if (/timeout|timed out|aborted/i.test(msg)) return { kind: 'timeout', title: 'This is taking too long', message: 'Your connection seems slow. Try again in a moment.' };
  if (status === 401 || /jwt|session|not authenticated|sign in/i.test(msg)) return { kind: 'auth', title: 'Please sign in again', message: 'Your session ended. Sign in to continue where you left off.' };
  if (status === 403 || /permission|not allowed|forbidden|42501/i.test(msg)) return { kind: 'forbidden', title: 'You don’t have permission', message: msg && !/non-2xx/i.test(msg) ? msg : 'Your account isn’t allowed to do this.' };
  if (status === 404) return { kind: 'notfound', title: 'Not found', message: 'This item may have been removed or the link is wrong.' };
  if (status && status >= 500) return { kind: 'server', title: 'Something went wrong on our side', message: 'It’s not something you did. Please try again in a moment.' };
  if (status && status >= 400 && msg && !/non-2xx/i.test(msg)) return { kind: 'validation', title: 'Please check your details', message: msg };
  return { kind: 'unknown', title: 'Couldn’t load this', message: msg && !/non-2xx/i.test(msg) ? msg : 'Something went wrong. Please try again.' };
}

