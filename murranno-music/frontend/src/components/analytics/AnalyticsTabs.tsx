import React from 'react';
import { cn } from '@/lib/utils';
import { AnalyticsTab } from '@/types/analytics';

interface AnalyticsTabsProps {
  tabs: AnalyticsTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const AnalyticsTabs = ({ tabs, activeTab, onTabChange }: AnalyticsTabsProps) => {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-2 min-w-max pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-secondary/30 text-foreground hover:bg-secondary/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
