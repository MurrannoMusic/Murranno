import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
// For admin types, assuming same shape in RN
import { AdminAnalytics } from '@/types/admin';

export function useAdminStats() {
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['admin-platform-analytics'],
        queryFn: async () => {
            // Note: In React Native, ensure the supabase client is properly imported from your RN supabase config
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
