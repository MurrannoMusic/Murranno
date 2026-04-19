import React from 'react';
import { cn } from '@/lib/utils';
import { TimePeriod } from '@/types/analytics';

interface TimePeriodFilterProps {
  periods: TimePeriod[];
  activePeriod: string;
  onPeriodChange: (periodId: string) => void;
}

export const TimePeriodFilter = ({ periods, activePeriod, onPeriodChange }: TimePeriodFilterProps) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {periods.map((period) => (
        <button
          key={period.id}
          onClick={() => onPeriodChange(period.id)}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-semibold transition-all",
            activePeriod === period.id
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-secondary/30 text-foreground hover:bg-secondary/50"
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};
