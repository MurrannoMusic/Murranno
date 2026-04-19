import { MoreVertical, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Campaign } from '@/types/campaign';

interface CampaignCardProps {
  campaign: Campaign;
  getStatusBadgeVariant: (status: string) => string;
  onEdit?: (id: string) => void;
  onViewAnalytics?: (id: string) => void;
  onPause?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export const CampaignCard = ({ 
  campaign, 
  getStatusBadgeVariant, 
  onEdit, 
  onViewAnalytics, 
  onPause, 
  onDuplicate 
}: CampaignCardProps) => {
  return (
    <div className="interactive-element p-4 bg-muted/20 rounded-xl border border-border/10">
      <div className="space-y-3">
        {/* Campaign Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">{campaign.name}</h3>
              <Badge variant={getStatusBadgeVariant(campaign.status) as any} className="text-xs">
                {campaign.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{campaign.artist} • {campaign.platform}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-border/20">
              <DropdownMenuItem onClick={() => onEdit?.(campaign.id)}>
                Edit Campaign
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewAnalytics?.(campaign.id)}>
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPause?.(campaign.id)}>
                {campaign.status === 'Active' ? 'Pause' : 'Resume'} Campaign
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate?.(campaign.id)}>
                Duplicate Campaign
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Budget / Spent</p>
            <p className="font-semibold">{campaign.budget} / {campaign.spent}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Reach</p>
            <p className="font-semibold">{campaign.reach}</p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/10 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Engagement</p>
            <p className="font-semibold text-primary">{campaign.engagement}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Duration</p>
            <p className="font-semibold">
              {new Date(campaign.startDate).toLocaleDateString()}
              {campaign.endDate && ` - ${new Date(campaign.endDate).toLocaleDateString()}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};