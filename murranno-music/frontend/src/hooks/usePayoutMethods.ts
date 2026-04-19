import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PayoutMethod {
  id: string;
  user_id: string;
  type: string;
  recipient_code: string;
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  currency: string;
  is_primary: boolean;
  is_verified: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const usePayoutMethods = () => {
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPayoutMethods = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-payout-methods');

      if (error) throw error;
      
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch payout methods');
      }
      
      setPayoutMethods(data.payoutMethods || []);
    } catch (error: any) {
      console.error('Error fetching payout methods:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch payout methods',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMethod = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('delete-payout-method', {
        body: { payoutMethodId: id }
      });

      if (error) throw error;
      
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to delete payout method');
      }

      toast({
        title: 'Success',
        description: 'Payout method removed',
      });

      await fetchPayoutMethods();
    } catch (error: any) {
      console.error('Error deleting payout method:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove payout method',
        variant: 'destructive',
      });
    }
  };

  const setPrimary = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('paystack-set-primary-method', {
        body: { payoutMethodId: id }
      });

      if (error) throw error;
      
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to update primary method');
      }

      toast({
        title: 'Success',
        description: 'Primary payout method updated',
      });

      await fetchPayoutMethods();
    } catch (error: any) {
      console.error('Error setting primary method:', error);
      toast({
        title: 'Error',
        description: 'Failed to set primary method',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchPayoutMethods();
  }, []);

  return {
    payoutMethods,
    loading,
    deleteMethod,
    setPrimary,
    refetch: fetchPayoutMethods,
  };
};
