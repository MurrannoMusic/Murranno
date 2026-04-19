import { Target, Users, BarChart3, Download, Zap } from 'lucide-react';
import mmLogo from "@/assets/mm_logo.png";
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModernStatCard } from '@/components/modern/ModernStatCard';
import { AvatarDropdown } from '@/components/layout/AvatarDropdown';

import { useUserType } from '@/hooks/useUserType';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useEffect } from 'react';
import { AnalyticsCarousel } from '@/components/analytics/AnalyticsCarousel';

export const AgencyDashboard = () => {
  const { currentUser, loading } = useUserType();
  const { campaigns, stats: campaignStats, loading: campaignsLoading } = useCampaigns();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      // navigate('/app/user-type-selection', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="mobile-container py-8 text-center text-muted-foreground text-sm">
          {loading ? 'Loading...' : 'Redirecting…'}
        </div>
      </div>
    );
  }

  return (
    <div className="smooth-scroll">
      {/* Top Bar removed - using UnifiedTopBar */}

      <div className="mobile-container space-y-4 -mt-2">
        {/* Crypto-style Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-[20px] p-4 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div className="text-right">
                <div className="text-xs text-success font-medium">+3</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-card-foreground">8</div>
              <div className="text-xs text-muted-foreground font-medium">Active Campaigns</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[20px] p-4 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="text-right">
                <div className="text-xs text-success font-medium">+28%</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-card-foreground">156K</div>
              <div className="text-xs text-muted-foreground font-medium">Total Reach</div>
            </div>
          </div>
        </div>

        {/* Performance Analytics Carousel */}
        <div className="w-full">
          <h3 className="text-lg font-bold text-card-foreground mb-3">Performance Insights</h3>
          <AnalyticsCarousel />
        </div>

        {/* Active Campaigns */}
        <Card className="bg-card border border-border rounded-[20px] shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-card-foreground">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {campaignsLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading campaigns...</div>
            ) : campaigns.filter(c => c.status === 'Active').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No active campaigns. Start a new campaign to promote your artists.
              </div>
            ) : (
              campaigns.filter(c => c.status === 'Active').map((campaign) => (
                <div key={campaign.id} className="flex items-center gap-4 p-4 bg-secondary/20 rounded-[16px] border border-border">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-card-foreground">{campaign.artist}</h3>
                        <Badge
                          variant={campaign.status === 'Active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      <span className="text-sm font-bold text-success">{campaign.reach}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{campaign.name}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">Budget: {campaign.budget}</span>
                      <span className="text-xs font-medium text-card-foreground">{campaign.platform}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border border-border rounded-[20px] shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-card-foreground">Agency Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Link to="/app/promotions">
                <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-[16px] transition-all duration-200 shadow-primary hover:shadow-glow transform hover:scale-[1.02] active:scale-[0.98]">
                  Create Campaign
                </button>
              </Link>

              <Link to="/app/campaign-manager">
                <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-4 px-6 rounded-[16px] transition-all duration-200 border border-border hover:border-border/50">
                  Manage Campaigns
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link to="/app/client-management">
                <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-4 px-6 rounded-[16px] transition-all duration-200 border border-border hover:border-border/50">
                  Manage Clients
                </button>
              </Link>

              <Link to="/app/agency-analytics">
                <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-4 px-6 rounded-[16px] transition-all duration-200 border border-border hover:border-border/50">
                  View Analytics
                </button>
              </Link>

              <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-4 px-6 rounded-[16px] transition-all duration-200 border border-border hover:border-border/50">
                Client Analytics
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};