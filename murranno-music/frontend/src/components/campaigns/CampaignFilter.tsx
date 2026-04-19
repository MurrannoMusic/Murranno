import { Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CampaignFilterProps {
  statusFilter: string;
  onFilterChange: (value: string) => void;
}

export const CampaignFilter = ({ statusFilter, onFilterChange }: CampaignFilterProps) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-[20px] shadow-soft">
      <Filter className="h-4 w-4 text-primary flex-shrink-0" />
      <Select value={statusFilter} onValueChange={onFilterChange}>
        <SelectTrigger className="flex-1 bg-transparent border-0 focus:ring-0 font-medium text-sm h-8">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent className="bg-card border border-border">
          <SelectItem value="all">All Campaigns</SelectItem>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="Paused">Paused</SelectItem>
          <SelectItem value="Draft">Draft</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
