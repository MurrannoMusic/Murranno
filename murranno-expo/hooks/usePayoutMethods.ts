import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  created_at: string;
}

export const usePayoutMethods = () => {
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayoutMethods = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-payout-methods');
      if (error) throw error;
      if (data?.success) setPayoutMethods(data.payoutMethods || []);
    } catch (err) {
      console.error('usePayoutMethods error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMethod = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('delete-payout-method', {
        body: { payoutMethodId: id },
      });
      if (error) throw error;
      if (data?.success) await fetchPayoutMethods();
    } catch (err) {
      console.error('deleteMethod error:', err);
    }
  };

  const setPrimary = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('paystack-set-primary-method', {
        body: { payoutMethodId: id },
      });
      if (error) throw error;
      if (data?.success) await fetchPayoutMethods();
    } catch (err) {
      console.error('setPrimary error:', err);
    }
  };

  useEffect(() => {
    fetchPayoutMethods();
  }, []);

  return { payoutMethods, loading, deleteMethod, setPrimary, refetch: fetchPayoutMethods };
};
