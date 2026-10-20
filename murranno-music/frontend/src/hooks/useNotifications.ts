import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBadgeCount } from './useBadgeCount';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  related_type?: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Update badge count whenever unread count changes
  const { clearBadge } = useBadgeCount(unreadCount);

  useEffect(() => {
    fetchNotifications();
    // The API has no realtime channels: poll, and toast anything that arrived since the last poll.
    const timer = setInterval(() => fetchNotifications(true), 30_000);
    return () => clearInterval(timer);
  }, []);

  const fetchNotifications = async (announceNew = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const next = (data as Notification[]) || [];
      setNotifications(prev => {
        if (announceNew) {
          const known = new Set(prev.map(n => n.id));
          next
            .filter(n => !known.has(n.id) && !n.is_read)
            .forEach(n => toast[n.type](n.title, { description: n.message }));
        }
        return next;
      });
      setUnreadCount(next.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setUnreadCount(0);
      
      // Clear the badge since all notifications are read
      await clearBadge();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
