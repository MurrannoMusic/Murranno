import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CampaignCard } from '@/components/cards/CampaignCard';
import { Campaign } from '@/types/campaign';

interface CampaignListProps {
  campaigns: Campaign[];
  statusFilter: string;
  getStatusBadgeVariant: (status: string) => string;
  onEdit: (id: string) => void;
  onViewAnalytics: (id: string) => void;
  onPause: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export const CampaignList = ({
  campaigns,
  statusFilter,
  getStatusBadgeVariant,
  onEdit,
  onViewAnalytics,
  onPause,
  onDuplicate,
}: CampaignListProps) => {
  return (
    <Card className="bg-card border border-border rounded-[20px] shadow-soft">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-card-foreground">
          {statusFilter === 'all' ? 'All Campaigns' : `${statusFilter} Campaigns`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            getStatusBadgeVariant={getStatusBadgeVariant}
            onEdit={onEdit}
            onViewAnalytics={onViewAnalytics}
            onPause={onPause}
            onDuplicate={onDuplicate}
          />
        ))}
      </CardContent>
    </Card>
  );
};
