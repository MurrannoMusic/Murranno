import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import mmLogo from "@/assets/mm_logo.png";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AvatarDropdown } from '@/components/layout/AvatarDropdown';
import { AnalyticsTabs } from '@/components/analytics/AnalyticsTabs';
import { TimePeriodFilter } from '@/components/analytics/TimePeriodFilter';
import { StatsComparison } from '@/components/analytics/StatsComparison';
import { StreamsChart } from '@/components/analytics/StreamsChart';
import { AnalyticsFilters } from '@/components/analytics/AnalyticsFilters';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsTab, TimePeriod } from '@/types/analytics';

const analyticsTabs: AnalyticsTab[] = [
  { id: 'streams', label: 'Streams' },
  { id: 'tracks', label: 'Tracks' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'stores', label: 'Stores' },
  { id: 'audience', label: 'Audience' },
];

const timePeriods: TimePeriod[] = [
  { id: 'week', label: 'Week', days: 7 },
  { id: 'month', label: 'Month', days: 30 },
  { id: '90days', label: '90 Days', days: 90 },
  { id: 'year', label: 'Year', days: 365 },
];

export const Analytics = () => {
  const [showFilters, setShowFilters] = useState(false);
  const {
    activeTab,
    setActiveTab,
    activePeriod,
    setActivePeriod,
    filters,
    resetFilters,
    chartData,
    stats,
  } = useAnalytics();

  const handleUpdateFilters = () => {
    setShowFilters(false);
  };

  return (
    <div className="smooth-scroll">
      {/* Top Bar removed - using UnifiedTopBar */}

      <div className="mobile-container space-y-3 mt-2 pb-16">
        {/* Analytics Tabs */}
        <AnalyticsTabs
          tabs={analyticsTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Page Title & Filter Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            {analyticsTabs.find(tab => tab.id === activeTab)?.label}
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(true)}
            className="border border-border rounded-xl px-3 py-1.5 h-8 text-xs"
          >
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            Filter
          </Button>
        </div>

        {/* Time Period Filter */}
        <TimePeriodFilter
          periods={timePeriods}
          activePeriod={activePeriod}
          onPeriodChange={setActivePeriod}
        />

        {/* Stats Comparison Card */}
        <StatsComparison
          stats={stats}
          label={analyticsTabs.find(tab => tab.id === activeTab)?.label || 'Streams'}
        />

        {/* Chart */}
        <StreamsChart data={chartData} />
      </div>

      {/* Filters Sheet */}
      <AnalyticsFilters
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onReset={resetFilters}
        onUpdate={handleUpdateFilters}
      />
    </div>
  );
};
