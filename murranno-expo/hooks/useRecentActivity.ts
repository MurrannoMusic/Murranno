import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Activity {
  id: string;
  title: string;
  time: string;
  type: 'release' | 'campaign' | 'earning' | 'info';
  icon: 'upload' | 'dollar' | 'play' | 'info';
  value?: string;
}

export const useRecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      setActivities(
        (data || []).map((n: any) => {
          const ago = getTimeAgo(n.created_at);
          const icon: Activity['icon'] =
            n.type === 'earning' ? 'dollar' :
            n.type === 'release' ? 'upload' :
            n.type === 'campaign' ? 'play' : 'info';
          return {
            id: n.id,
            title: n.title,
            time: ago,
            type: n.type,
            icon,
            value: undefined,
          };
        })
      );
    } catch (err) {
      console.error('useRecentActivity error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { activities, loading, refetch: fetchActivity };
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
