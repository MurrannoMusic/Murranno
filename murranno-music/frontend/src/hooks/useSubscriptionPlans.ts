import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
  id: string;
  tier: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_artists?: number;
  max_releases?: number;
}

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-subscription-plans');
      
      if (error) throw error;
      
      return data.plans as SubscriptionPlan[];
    },
  });
};
