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
  const [error, setError] = useState<unknown>(null);

  // `silent` background refreshes keep showing the current balance instead of a loading state.
  const fetchBalance = async (silent = false) => {
    try {
      setError(null);
      if (!silent) setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user found');
        setBalance(null);
        setLoading(false);
        return;
      }

      console.log('Fetching wallet balance for user:', user.id);

      const { data, error } = await supabase.functions.invoke('get-wallet-balance');

      if (error) {
        console.error('Error fetching wallet balance:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch wallet balance');
      }

      console.log('Wallet balance fetched:', data.balance);
      setBalance(data.balance);
    } catch (error: any) {
      setError(error);
      console.error('Error in fetchBalance:', error);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    // The API has no realtime channels: poll for balance changes instead.
    const timer = setInterval(() => fetchBalance(true), 30_000);
    return () => clearInterval(timer);
  }, []);

  return {
    error,
    balance,
    loading,
    refetch: () => fetchBalance(),
  };
};
