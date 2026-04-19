import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminAnalytics } from '@/types/admin';

export function useAdminStats() {
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['admin-platform-analytics'],
        queryFn: async () => {
            const { data, error } = await supabase.functions.invoke('admin-get-platform-analytics');
            if (error) throw error;
            return data.analytics as AdminAnalytics;
        },
    });

    return {
        analytics,
        isLoading,
    };
}
