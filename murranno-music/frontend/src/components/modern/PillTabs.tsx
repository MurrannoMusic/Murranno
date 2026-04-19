import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
}

interface PillTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const PillTabs = ({ tabs, activeTab, onTabChange, className }: PillTabsProps) => {
  return (
    <div className={cn("flex bg-secondary/30 rounded-full p-1 backdrop-blur-xl", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "pill-tab",
            activeTab === tab.id ? "active" : "inactive"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};