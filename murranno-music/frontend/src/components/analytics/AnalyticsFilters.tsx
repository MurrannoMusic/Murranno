import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { AnalyticsFilters as Filters } from '@/types/analytics';

interface AnalyticsFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: Filters;
  onReset: () => void;
  onUpdate: () => void;
}

export const AnalyticsFilters = ({ 
  open, 
  onOpenChange, 
  filters, 
  onReset, 
  onUpdate 
}: AnalyticsFiltersProps) => {
  const filterCategories = [
    { key: 'label', label: 'Label', value: filters.label || 'All' },
    { key: 'artist', label: 'Artist', value: filters.artist || 'All' },
    { key: 'release', label: 'Release', value: filters.release || 'All' },
    { key: 'track', label: 'Track', value: filters.track || 'All' },
    { key: 'country', label: 'Country', value: filters.country || 'All' },
    { key: 'store', label: 'Store', value: filters.store || 'All' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-[20px]">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold text-center">Filters</SheetTitle>
        </SheetHeader>

        <div className="space-y-3 mb-6">
          {/* Reset Filter */}
          <button
            onClick={onReset}
            className="w-full flex items-center justify-between p-4 bg-secondary/20 rounded-[16px] border border-border hover:bg-secondary/30 transition-smooth"
          >
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Reset filter</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Filter Categories */}
          {filterCategories.map((category) => (
            <button
              key={category.key}
              className="w-full flex items-center justify-between p-4 bg-card/50 rounded-[16px] border border-border hover:bg-card transition-smooth"
            >
              <span className="text-sm font-medium text-foreground">{category.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{category.value}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>

        {/* Update Results Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <Button 
            onClick={onUpdate}
            className="w-full h-12 bg-primary text-primary-foreground rounded-[16px] font-semibold text-base"
          >
            Update Results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
