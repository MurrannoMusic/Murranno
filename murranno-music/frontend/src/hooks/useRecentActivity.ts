import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  value: string;
  time: string;
  type: 'success' | 'primary' | 'info';
  icon: 'dollar' | 'upload' | 'play';
}

export const useRecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      
      // Get user's artist profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: artist } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!artist) {
        setActivities([]);
        setLoading(false);
        return;
      }

      const allActivities: ActivityItem[] = [];

      // Fetch recent earnings
      const { data: earnings } = await supabase
        .from('earnings')
        .select('*')
        .eq('artist_id', artist.id)
        .order('created_at', { ascending: false })
        .limit(2);

      if (earnings) {
        earnings.forEach(earning => {
          allActivities.push({
            id: earning.id,
            title: 'Streaming payout received',
            description: `From ${earning.platform || earning.source}`,
            value: `+₦${Number(earning.amount).toFixed(2)}`,
            time: getRelativeTime(earning.created_at),
            type: 'success',
            icon: 'dollar',
          });
        });
      }

      // Fetch recent releases
      const { data: releases } = await supabase
        .from('releases')
        .select('*')
        .eq('artist_id', artist.id)
        .order('created_at', { ascending: false })
        .limit(2);

      if (releases) {
        releases.forEach(release => {
          allActivities.push({
            id: release.id,
            title: `New ${release.release_type.toLowerCase()} uploaded`,
            description: release.title,
            value: release.status,
            time: getRelativeTime(release.created_at),
            type: 'primary',
            icon: 'upload',
          });
        });
      }

      // Sort all activities by time
      allActivities.sort((a, b) => {
        const timeA = parseRelativeTime(a.time);
        const timeB = parseRelativeTime(b.time);
        return timeA - timeB;
      });

      setActivities(allActivities.slice(0, 3));
    } catch (error: any) {
      console.error('Error fetching recent activity:', error);
      // Don't show error toast, just use empty state
    } finally {
      setLoading(false);
    }
  };

  return {
    activities,
    loading,
    refetch: fetchRecentActivity,
  };
};

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function parseRelativeTime(timeStr: string): number {
  const match = timeStr.match(/(\d+)([mhd])/);
  if (!match) return 0;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  if (unit === 'm') return value;
  if (unit === 'h') return value * 60;
  if (unit === 'd') return value * 1440;
  return 0;
}
