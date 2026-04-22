import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: string;
    features: string[];
    is_popular?: boolean;
}

export interface UserSubscription {
    plan_name: string;
    status: string;
    current_period_end: string | null;
}

export const useSubscriptions = () => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [plansRes, statusRes] = await Promise.all([
                supabase.functions.invoke('get-subscription-plans'),
                supabase.functions.invoke('get-subscription-status'),
            ]);
            if (plansRes.data?.success)  setPlans(plansRes.data.plans  ?? []);
            if (statusRes.data?.success) setCurrentSub(statusRes.data.subscription ?? null);
        } catch (err) {
            console.error('useSubscriptions error:', err);
        } finally {
            setLoading(false);
        }
    };

    return { plans, currentSub, loading, refetch: fetchData };
};
