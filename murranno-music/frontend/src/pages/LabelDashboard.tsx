import { Users, Clock, DollarSign, TrendingUp, Upload, Play } from 'lucide-react';
import mmLogo from "@/assets/mm_logo.png";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { FloatingActionButton } from '@/components/mobile/FloatingActionButton';
import { UserTypeDemo } from '@/components/mobile/UserTypeDemo';
import { ArtistSelector } from '@/components/mobile/ArtistSelector';
import { StatsGrid } from '@/components/stats/StatsGrid';
import { AvatarDropdown } from '@/components/layout/AvatarDropdown';

import { useUserType } from '@/hooks/useUserType';
import { useStats } from '@/hooks/useStats';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { AnalyticsCarousel } from '@/components/analytics/AnalyticsCarousel';

export const LabelDashboard = () => {
  const { currentUser, selectedArtist, loading } = useUserType();
  const { getStatsAsItems } = useStats();
  const { activities } = useRecentActivity();
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

  const stats = getStatsAsItems();

  const headerTitle = selectedArtist
    ? `Managing: ${(currentUser as any).artists.find((a: any) => a.id === selectedArtist)?.stageName}`
    : `${(currentUser as any).companyName}`;

  const headerSubtitle = selectedArtist
    ? "Artist management dashboard"
    : "Label dashboard - manage all artists";

  return (
    <div className="smooth-scroll">
      {/* Top Bar removed - using UnifiedTopBar */}

      <div className="mobile-container space-y-4 -mt-2">
        {/* Artist Selector */}
        <ArtistSelector />

        {/* Crypto-style Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-[20px] p-4 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div className="text-right">
                <div className={`text-xs font-medium ${stats[1]?.changeType === 'positive' ? 'text-success' : 'text-muted-foreground'}`}>
                  {stats[1]?.change}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-card-foreground">
                {stats[1]?.value}
              </div>
              <div className="text-xs text-muted-foreground font-medium">Total Earnings</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[20px] p-4 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="text-right">
                <div className={`text-xs font-medium ${stats[0]?.changeType === 'positive' ? 'text-success' : 'text-muted-foreground'}`}>
                  {stats[0]?.change}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-card-foreground">
                {stats[0]?.value}
              </div>
              <div className="text-xs text-muted-foreground font-medium">Total Streams</div>
            </div>
          </div>
        </div>

        {/* Performance Analytics Carousel */}
        <div className="w-full">
          <h3 className="text-lg font-bold text-card-foreground mb-3">Performance Insights</h3>
          <AnalyticsCarousel />
        </div>

        {/* Recent Activity */}
        <Card className="bg-card border border-border rounded-[20px] shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-card-foreground flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No recent activity. Your artists' releases and earnings will appear here.
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 bg-secondary/20 rounded-[16px] border border-border">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    {activity.icon === 'dollar' && <DollarSign className="h-5 w-5 text-primary" />}
                    {activity.icon === 'upload' && <Upload className="h-5 w-5 text-primary" />}
                    {activity.icon === 'play' && <Play className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-card-foreground truncate">{activity.title}</p>
                      <span className={`text-sm font-bold ${activity.type === 'success' ? 'text-success' :
                        activity.type === 'primary' ? 'text-primary' :
                          'text-card-foreground'
                        }`}>
                        {activity.value}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border border-border rounded-[20px] shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-card-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Link to="/app/upload">
                <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-[16px] transition-all duration-200 shadow-primary hover:shadow-glow transform hover:scale-[1.02] active:scale-[0.98]">
                  Upload Track
                </button>
              </Link>

              <Link to="/app/promotions">
                <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-4 px-6 rounded-[16px] transition-all duration-200 border border-border hover:border-border/50">
                  Start Campaign
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link to="/app/label-analytics">
                <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-4 px-6 rounded-[16px] transition-all duration-200 border border-border hover:border-border/50">
                  View Analytics
                </button>
              </Link>

              <Link to="/app/payout-manager">
                <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-4 px-6 rounded-[16px] transition-all duration-200 border border-border hover:border-border/50">
                  Manage Payouts
                </button>
              </Link>
            </div>

            <Link to="/app/artist-management">
              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-[16px] transition-all duration-200 shadow-primary hover:shadow-glow transform hover:scale-[1.02] active:scale-[0.98]">
                Manage Artists
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <FloatingActionButton />
    </div>
  );
};