import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const fetchBalance = async () => {
    try {
      setLoading(true);
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
      console.error('Error in fetchBalance:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch wallet balance',
        variant: 'destructive',
      });
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();

    const channel = supabase
      .channel('wallet_balance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_balance',
        },
        () => {
          fetchBalance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    balance,
    loading,
    refetch: fetchBalance,
  };
};
