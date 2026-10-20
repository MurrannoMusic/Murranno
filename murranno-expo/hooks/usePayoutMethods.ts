import {notify, errorMessage, confirmAction} from '@/lib/api';
import {useFocusEffect} from '@react-navigation/native';
import { useState, useCallback } from 'react';
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
  const [error, setError] = useState<string|null>(null);

  const fetchPayoutMethods = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const { data, error } = await supabase.functions.invoke('get-payout-methods');
      if (error) throw error;
      if (data?.success) setPayoutMethods(data.payoutMethods || []);
    } catch (err) {
      setError(await errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMethod = async (id: string) => {
    if (!await confirmAction('Remove payout account', 'Remove this bank account? Existing withdrawals keep their original destination.')) return;
    try {
      const { data, error } = await supabase.functions.invoke('delete-payout-method', {
        body: { payoutMethodId: id },
      });
      if (error) throw error;
      if (data?.success) await fetchPayoutMethods();
    } catch (err) {
      notify('Account not removed', await errorMessage(err));
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
      notify('Primary account not changed', await errorMessage(err));
    }
  };

  useFocusEffect(useCallback(() => { void fetchPayoutMethods(); }, [fetchPayoutMethods]));

  return { payoutMethods, loading, error, deleteMethod, setPrimary, refetch: fetchPayoutMethods };
};
