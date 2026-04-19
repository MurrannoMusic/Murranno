/**
 * React Native Wallet Data Hook
 * Fetches balance, payout methods, and transactions
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type WalletBalance = Tables<'wallet_balance'>;
type PayoutMethod = Tables<'payout_methods'>;
type WithdrawalTransaction = Tables<'withdrawal_transactions'>;

interface UseWalletReturn {
  balance: WalletBalance | null;
  payoutMethods: PayoutMethod[];
  transactions: WithdrawalTransaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useWallet = (userId: string | undefined): UseWalletReturn => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [transactions, setTransactions] = useState<WithdrawalTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all wallet data in parallel
      const [balanceRes, methodsRes, transactionsRes] = await Promise.all([
        supabase
          .from('wallet_balance')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('payout_methods')
          .select('*')
          .eq('user_id', userId)
          .order('is_primary', { ascending: false }),
        supabase
          .from('withdrawal_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (balanceRes.error && balanceRes.error.code !== 'PGRST116') {
        throw balanceRes.error;
      }
      if (methodsRes.error) throw methodsRes.error;
      if (transactionsRes.error) throw transactionsRes.error;

      setBalance(balanceRes.data);
      setPayoutMethods(methodsRes.data ?? []);
      setTransactions(transactionsRes.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  return {
    balance,
    payoutMethods,
    transactions,
    loading,
    error,
    refetch: fetchWalletData,
  };
};
