import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Subscription {
    id: string;
    user_id: string;
    tier: string;
    status: 'active' | 'trial' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid';
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    trial_start: string | null;
    trial_ends_at: string | null;
    created_at: string;
    updated_at: string;
    subscription_plans?: {
        name: string;
        price_monthly: number;
        currency: string;
        max_artists: number;
        features: string[];
    };
    isActive: boolean;
    isTrial: boolean;
    trialEnded: boolean;
    periodEnded: boolean;
    daysRemaining: number;
}

export interface UserSubscriptionsResponse {
    success: boolean;
    subscriptions: Subscription[];
    accessibleTiers: string[];
    hasLabelAccess: boolean;
    hasAgencyAccess: boolean;
}

export const useUserSubscriptions = () => {
    return useQuery({
        queryKey: ['user-subscriptions'],
        queryFn: async () => {
            const { data, error } = await supabase.functions.invoke('get-user-subscriptions');

            if (error) {
                throw error;
            }

            return data as UserSubscriptionsResponse;
        },
    });
};
