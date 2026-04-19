import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EarningsTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  description: string;
}

export interface EarningsSource {
  id: string;
  platform: string;
  amount: number;
  streams: number;
  percentage: number;
  growth: number;
  icon: string;
}

export const useWallet = () => {
  const [transactions, setTransactions] = useState<EarningsTransaction[]>([]);
  const [earningsSources, setEarningsSources] = useState<EarningsSource[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchWalletData = async () => {
    try {
      setLoading(true);

      const { data: txData } = await supabase.functions.invoke('get-wallet-transactions', {
        body: { limit: 50 },
      });
      if (txData?.transactions) setTransactions(txData.transactions);

      const { data: earningsData } = await supabase.functions.invoke('get-earnings-breakdown', {
        body: { period: 30 },
      });
      if (earningsData?.sources) setEarningsSources(earningsData.sources);
    } catch (err) {
      console.error('useWallet error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((tx) => {
        const okStatus = statusFilter === 'all' || tx.status === statusFilter;
        const okType = typeFilter === 'all' || tx.type === typeFilter;
        return okStatus && okType;
      }),
    [transactions, statusFilter, typeFilter],
  );

  return {
    transactions: filteredTransactions,
    earningsSources,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    loading,
    refetch: fetchWalletData,
  };
};
