import { TrendingUp, Users, Target, Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageContainer } from '@/components/layout/PageContainer';
import { AvatarDropdown } from '@/components/layout/AvatarDropdown';

export const Results = () => {
  const campaignResults = [
    {
      id: 1,
      name: 'TikTok Viral Push',
      artist: 'Luna Sol',
      status: 'Completed',
      reach: '125.3K',
      engagement: '18.5%',
      conversions: '4,230',
      spent: '₦299',
      roi: '+285%'
    },
    {
      id: 2,
      name: 'Instagram Stories',
      artist: 'The Echoes',
      status: 'Active',
      reach: '89.2K',
      engagement: '12.8%',
      conversions: '2,150',
      spent: '₦149',
      roi: '+195%'
    },
    {
      id: 3,
      name: 'YouTube Pre-roll',
      artist: 'Midnight Drive',
      status: 'Completed',
      reach: '245.7K',
      engagement: '22.1%',
      conversions: '8,940',
      spent: '₦599',
      roi: '+420%'
    }
  ];

  const totalMetrics = {
    totalReach: '460.2K',
    avgEngagement: '17.8%',
    totalConversions: '15,320',
    totalSpent: '₦1,047',
    avgROI: '+300%'
  };

  return (
    <PageContainer>
      {/* Top Bar removed - using UnifiedTopBar */}

      <div className="mobile-container space-y-4 -mt-2">
        {/* Overall Performance Stats */}
        <div className="grid grid-cols-2 gap-2">
          <Card className="bg-card border border-border rounded-[20px] shadow-soft">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-card-foreground">{totalMetrics.totalReach}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Total Reach</p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border rounded-[20px] shadow-soft">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-success">{totalMetrics.avgEngagement}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Avg Engagement</p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border rounded-[20px] shadow-soft">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-card-foreground">{totalMetrics.totalConversions}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Conversions</p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border rounded-[20px] shadow-soft">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-success">{totalMetrics.avgROI}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Avg ROI</p>
            </CardContent>
          </Card>
        </div>

        {/* Total Spent Summary */}
        <Card className="bg-card border border-border rounded-[20px] shadow-soft">
          <CardContent className="p-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-lg font-bold text-card-foreground">{totalMetrics.totalSpent}</p>
          </CardContent>
        </Card>

        {/* Campaign Results List */}
        <Card className="bg-card border border-border rounded-[20px] shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-card-foreground">Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {campaignResults.map((campaign) => (
              <div key={campaign.id} className="p-4 bg-secondary/20 rounded-[16px] border border-border space-y-2">
                {/* Campaign Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-card-foreground truncate">{campaign.name}</h3>
                      <Badge
                        variant={campaign.status === 'Active' ? 'default' : 'secondary'}
                        className="text-[10px] flex-shrink-0"
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{campaign.artist}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-bold text-success">{campaign.roi}</p>
                    <p className="text-[10px] text-muted-foreground">ROI</p>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                  <div className="text-center">
                    <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-1">
                      <Users className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-xs font-bold text-card-foreground">{campaign.reach}</p>
                    <p className="text-[10px] text-muted-foreground">Reach</p>
                  </div>
                  <div className="text-center">
                    <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-1">
                      <TrendingUp className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-xs font-bold text-card-foreground">{campaign.engagement}</p>
                    <p className="text-[10px] text-muted-foreground">Engagement</p>
                  </div>
                  <div className="text-center">
                    <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-1">
                      <Target className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-xs font-bold text-card-foreground">{campaign.conversions}</p>
                    <p className="text-[10px] text-muted-foreground">Conversions</p>
                  </div>
                </div>

                {/* Budget */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">Budget Spent</span>
                  <span className="text-sm font-bold text-card-foreground">{campaign.spent}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Export Actions */}
        <Card className="bg-card border border-border rounded-[20px] shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-card-foreground">Export & Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-[16px] transition-all duration-200 shadow-primary hover:shadow-glow transform hover:scale-[1.02] active:scale-[0.98] text-xs flex items-center justify-center gap-2">
              <Download className="h-3 w-3" />
              Download Full Report
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-semibold py-4 rounded-[16px] transition-all duration-200 text-xs">
                Export CSV
              </button>

              <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-semibold py-4 rounded-[16px] transition-all duration-200 text-xs">
                Share Report
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};
