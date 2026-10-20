import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {errorMessage} from '@/lib/api';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WalletBalance {
  id: string;
  user_id: string;
  available_balance: number;
  pending_balance: number;
  total_earnings: number;
  currency: string;
  updated_at: string;
  created_at: string;
}

export const useWalletBalance = () => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const { data, error } = await supabase.functions.invoke('get-wallet-balance');
      if (error) throw error;
      if (data?.success) setBalance(data.balance);
    } catch (err) {
      setError(await errorMessage(err));
      console.error('useWalletBalance error:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { void fetchBalance(); }, [fetchBalance]));



  return { balance, loading, error, refetch: fetchBalance };
};
