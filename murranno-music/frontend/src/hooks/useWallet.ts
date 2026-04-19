import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EarningsTransaction, PayoutMethod, WalletBalance, EarningsSource } from '@/types/wallet';
import { toast } from 'sonner';

export const useWallet = () => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<EarningsTransaction[]>([]);
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [earningsSources, setEarningsSources] = useState<EarningsSource[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);

      // Fetch wallet balance
      const { data: balanceData, error: balanceError } = await supabase.functions.invoke('get-wallet-balance');
      if (balanceError) throw balanceError;
      if (balanceData?.balance) {
        setBalance(balanceData.balance);
      }

      // Fetch transactions
      const { data: txData, error: txError } = await supabase.functions.invoke('get-wallet-transactions', {
        body: { limit: 50 }
      });
      if (txError) throw txError;
      if (txData?.transactions) {
        setTransactions(txData.transactions);
      }

      // Fetch payout methods
      const { data: methodsData, error: methodsError } = await supabase.functions.invoke('get-payout-methods');
      if (methodsError) throw methodsError;
      if (methodsData?.payoutMethods) {
        setPayoutMethods(methodsData.payoutMethods);
      }

      // Fetch earnings breakdown
      const { data: earningsData, error: earningsError } = await supabase.functions.invoke('get-earnings-breakdown', {
        body: { period: 30 }
      });
      if (earningsError) throw earningsError;
      if (earningsData?.sources) {
        setEarningsSources(earningsData.sources);
      }
    } catch (error: any) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      return matchesStatus && matchesType;
    });
  }, [transactions, statusFilter, typeFilter]);

  return {
    balance,
    transactions: filteredTransactions,
    allTransactions: transactions,
    payoutMethods,
    earningsSources,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    loading,
    refetch: fetchWalletData,
  };
};
