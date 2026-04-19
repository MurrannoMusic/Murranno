import { Card, CardContent } from '@/components/ui/card';
import { CampaignStats as CampaignStatsType } from '@/types/campaign';

interface CampaignStatsProps {
  stats: CampaignStatsType;
}

export const CampaignStats = ({ stats }: CampaignStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <Card className="bg-card border border-border rounded-[20px] shadow-soft">
        <CardContent className="p-3 text-center">
          <p className="text-xl font-bold text-card-foreground">{stats.totalCampaigns}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Total</p>
        </CardContent>
      </Card>
      
      <Card className="bg-card border border-border rounded-[20px] shadow-soft">
        <CardContent className="p-3 text-center">
          <p className="text-xl font-bold text-card-foreground">{stats.activeCampaigns}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Active</p>
        </CardContent>
      </Card>
      
      <Card className="bg-card border border-border rounded-[20px] shadow-soft">
        <CardContent className="p-3 text-center">
          <p className="text-xl font-bold text-card-foreground">{stats.totalSpent}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Spent</p>
        </CardContent>
      </Card>
      
      <Card className="bg-card border border-border rounded-[20px] shadow-soft">
        <CardContent className="p-3 text-center">
          <p className="text-xl font-bold text-card-foreground">{stats.totalReach}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Reach</p>
        </CardContent>
      </Card>
    </div>
  );
};
