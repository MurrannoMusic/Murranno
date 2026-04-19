import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AnalyticsStats } from '@/types/analytics';

interface StatsComparisonProps {
  stats: AnalyticsStats;
  label: string;
}

export const StatsComparison = ({ stats, label }: StatsComparisonProps) => {
  const isPositive = stats.percentageChange >= 0;

  return (
    <Card className="bg-card border border-border rounded-[20px] shadow-soft">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Current Period */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <h2 className="text-4xl font-bold text-primary mb-1">
              {stats.currentTotal.toLocaleString()}
            </h2>
            <p className="text-sm text-muted-foreground">{stats.currentDateRange}</p>
          </div>

          {/* Comparison */}
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {isPositive ? '+' : ''}{stats.percentageChange}%
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.previousTotal.toLocaleString()} • {stats.previousDateRange}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
