import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Building blocks shared with the Expo app's screens (same sizes and states).

export const PageTitle = ({ children, action }: { children: ReactNode; action?: ReactNode }) => (
  <div className="flex items-center justify-between gap-3">
    <h1 className="text-[32px] font-bold tracking-tight leading-tight">{children}</h1>
    {action}
  </div>
);

export const SectionTitle = ({ children, id }: { children: ReactNode; id?: string }) => (
  <h2 id={id} className="text-xl font-semibold tracking-tight">{children}</h2>
);

/** Underlined tabs (Analytics: Streams / Tracks / Stores / Audience). */
export function UnderlineTabs<T extends string>({ tabs, value, onChange, label }: { tabs: readonly T[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-6 border-b border-border overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={value === tab}
          onClick={() => onChange(tab)}
          className={cn(
            'min-h-12 py-3.5 -mb-px border-b-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            value === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

/** Grey track with a raised selected option (periods, Earnings sections, release type). */
export function Segmented<T extends string | number>({ options, value, onChange, label, className }: {
  options: readonly { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn('flex rounded-lg bg-secondary p-1', className)}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 min-h-10 rounded-md text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            value === o.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
