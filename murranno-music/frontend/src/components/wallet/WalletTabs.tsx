import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
}

interface WalletTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs: Tab[] = [
  { id: 'balance', label: 'Balance' },
  { id: 'methods', label: 'Payout Methods' },
  { id: 'history', label: 'History' }
];

export const WalletTabs = ({ activeTab, onTabChange }: WalletTabsProps) => {
  return (
    <div className="flex bg-secondary/30 rounded-full p-1 backdrop-blur-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground shadow-primary"
              : "bg-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
