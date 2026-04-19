import { TrendingUp, DollarSign, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageContainer } from '@/components/layout/PageContainer';
import { AvatarDropdown } from '@/components/layout/AvatarDropdown';
import { useAgencyCampaignAnalytics } from '@/hooks/useAgencyCampaignAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function AgencyAnalyticsDashboard() {
  const { analytics, campaignsByClient, loading } = useAgencyCampaignAnalytics();

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Agency Analytics</h1>
          <p className="text-muted-foreground">Campaign performance across all clients</p>
        </div>
        <AvatarDropdown />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-bold">{analytics?.totalCampaigns || 0}</p>
                <p className="text-xs text-green-500">{analytics?.activeCampaigns || 0} active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">₦{analytics?.totalSpent || '0'}</p>
                <p className="text-xs text-muted-foreground">of ₦{analytics?.totalBudget || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reach</p>
                <p className="text-2xl font-bold">{analytics?.totalReach || '0'}</p>
                <p className="text-xs text-muted-foreground">{analytics?.totalImpressions || '0'} impressions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-purple-500/10">
                <Zap className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg ROI</p>
                <p className="text-2xl font-bold">{analytics?.avgROI || '0'}%</p>
                <p className="text-xs text-muted-foreground">{analytics?.totalEngagement || '0'} engagements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Client */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance by Client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaignsByClient.map((client) => (
              <div 
                key={client.client_id}
                className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{client.artist_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {client.campaigns} campaigns • {client.active} active
                  </p>
                </div>

                <div className="text-right mr-4">
                  <p className="font-semibold">₦{client.spent}</p>
                  <p className="text-sm text-muted-foreground">of ₦{client.budget}</p>
                </div>

                <Badge variant={client.active > 0 ? 'default' : 'secondary'}>
                  {client.active > 0 ? 'Active' : 'Completed'}
                </Badge>
              </div>
            ))}
            {campaignsByClient.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No campaign data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
