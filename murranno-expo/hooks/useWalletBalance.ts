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

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-wallet-balance');
      if (error) throw error;
      if (data?.success) setBalance(data.balance);
    } catch (err) {
      console.error('useWalletBalance error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return { balance, loading, refetch: fetchBalance };
};
