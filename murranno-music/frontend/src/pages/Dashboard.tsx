import { Music, Clock, Upload, Play, DollarSign, BarChart3, TrendingUp, Newspaper } from 'lucide-react';
import { NewsCarousel } from '@/components/modern/NewsCarousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { FloatingActionButton } from '@/components/mobile/FloatingActionButton';
import { AvatarDropdown } from '@/components/layout/AvatarDropdown';
import { PageContainer } from '@/components/layout/PageContainer';
import { useUserType } from '@/hooks/useUserType';
import { useStats } from '@/hooks/useStats';
import { useEffect, useState } from 'react';
import { useDevice } from '@/hooks/useDevice';
import { useGeolocation } from '@/hooks/useGeolocation';
import mmLogo from "@/assets/mm_logo.png";
import { useCurrency } from '@/contexts/CurrencyContext';
import { TopTracksCard } from '@/components/modern/TopTracksCard';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { useTopTracks } from '@/hooks/useTopTracks';
import { AnalyticsCarousel } from '@/components/analytics/AnalyticsCarousel';

// Components
import { QuickActionBar } from '@/components/dashboard/QuickActionBar';
import { MilestoneTracker } from '@/components/dashboard/MilestoneTracker';
import { DistributionStatus } from '@/components/dashboard/DistributionStatus';
import { UpcomingReleaseCountdown } from '@/components/dashboard/UpcomingReleaseCountdown';
import { GettingStartedChecklist } from '@/components/dashboard/GettingStartedChecklist';

export const Dashboard = () => {
  const { currentUser, loading } = useUserType();
  const { getStatsAsItems } = useStats();
  const { activities } = useRecentActivity();
  const { tracks } = useTopTracks();
  const navigate = useNavigate();
  const { deviceInfo, getInfo } = useDevice();
  const { getCurrentPosition, checkPermissions } = useGeolocation();
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    // Analytics logging
    const logAnalytics = async () => {
      const info = await getInfo();
      console.log('Dashboard analytics - Device:', info);
      const permissions = await checkPermissions();
      if (permissions.location === 'granted') {
        const position = await getCurrentPosition();
        if (position) {
          console.log('Dashboard analytics - Location:', position.coords);
        }
      }
    };
    logAnalytics();
  }, []);

  if (loading || !currentUser) {
    return (
      <PageContainer>
        <div className="mobile-container py-8 text-center text-muted-foreground text-sm">
          {loading ? 'Loading...' : 'Redirecting…'}
        </div>
      </PageContainer>
    );
  }

  const stats = getStatsAsItems();


  return (
    <div className="smooth-scroll pb-16">
      {/* Top Bar removed - using UnifiedTopBar via AppLayout / Layout */}

      <div className="mobile-container space-y-4 mt-2">

        {/* Quick Actions */}
        <QuickActionBar />

        {/* Milestone Tracker */}
        <MilestoneTracker />

        {/* Upcoming Release Countdown */}
        <UpcomingReleaseCountdown />

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Earnings */}
          <div className="bg-card border border-border rounded-xl p-3 shadow-soft flex flex-col justify-between h-20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Earnings</span>
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div>
              <div className="text-base font-bold text-card-foreground">
                {formatCurrency(stats[1]?.value || "0")}
              </div>
              <div className={`text-[9px] font-medium ${stats[1]?.changeType === 'positive' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                {stats[1]?.change} this month
              </div>
            </div>
          </div>

          {/* Total Streams */}
          <div className="bg-card border border-border rounded-xl p-3 shadow-soft flex flex-col justify-between h-20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Streams</span>
              <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div>
              <div className="text-base font-bold text-card-foreground">
                {stats[0]?.value || "0"}
              </div>
              <div className={`text-[9px] font-medium ${stats[0]?.changeType === 'positive' ? 'text-blue-500' : 'text-muted-foreground'}`}>
                {stats[0]?.change} vs last month
              </div>
            </div>
          </div>
        </div>

        {/* Distribution Status */}
        <DistributionStatus />

        {/* Performance Insights */}
        <div>
          <h2 className="text-xs font-semibold mb-2 px-1 text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
            <BarChart3 className="h-3.5 w-3.5" /> Performance
          </h2>
          <AnalyticsCarousel />
        </div>

        {/* Top Performing Tracks */}
        {tracks.length > 0 && <TopTracksCard tracks={tracks} />}

        {/* News Carousel */}
        <div>
          <h2 className="text-xs font-semibold mb-2 px-1 text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
            <Newspaper className="h-3.5 w-3.5" /> News
          </h2>
          <NewsCarousel />
        </div>

        {/* Recent Activity / Getting Started */}
        <div>
          <h2 className="text-xs font-semibold mb-2 px-1 text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5" /> Activity
          </h2>
          <Card className="bg-card border border-border rounded-xl shadow-soft">
            <CardContent className="space-y-2 p-3">
              {activities.length === 0 ? (
                <GettingStartedChecklist />
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg border border-border/50">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      {activity.icon === 'dollar' && <DollarSign className="h-4 w-4 text-primary" />}
                      {activity.icon === 'upload' && <Upload className="h-4 w-4 text-primary" />}
                      {activity.icon === 'play' && <Play className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-card-foreground truncate">{activity.title}</p>
                        <span className={`text-xs font-bold ${activity.type === 'success' ? 'text-emerald-500' :
                          activity.type === 'primary' ? 'text-primary' :
                            'text-card-foreground'
                          }`}>
                          {formatCurrency(activity.value)}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>

        <FloatingActionButton />
      </div>
    </div>
  );
};