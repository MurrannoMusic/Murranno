import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {errorMessage} from '@/lib/api';
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
  streams: number | null;
  percentage: number;
  growth: number | null;
  icon: string;
}

export const useWallet = () => {
  const [transactions, setTransactions] = useState<EarningsTransaction[]>([]);
  const [earningsSources, setEarningsSources] = useState<EarningsSource[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true); setError(null);

      const { data: txData, error: txError } = await supabase.functions.invoke('get-wallet-transactions', {
        body: { limit: 50 },
      });
      if (txError) throw txError;
      if (txData?.transactions) setTransactions(txData.transactions);

      const { data: earningsData, error: earningsError } = await supabase.functions.invoke('get-earnings-breakdown', {
        body: { period: 30 },
      });
      if (earningsError) throw earningsError;
      if (earningsData) { const rows = earningsData.sources || earningsData.earnings || []; const total = rows.reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0); setEarningsSources(rows.map((s: any, i: number) => ({ ...s, id: s.id || `${s.platform}-${i}`, percentage: s.percentage ?? (total > 0 ? Number(s.amount || 0) / total * 100 : 0), streams: s.streams ?? null, growth: s.growth ?? null }))); }
    } catch (err) {
      setError(await errorMessage(err));
      console.error('useWallet error:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { void fetchWalletData(); }, [fetchWalletData]));



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
    totalCount: transactions.length,
    earningsSources,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    loading,
    error,
    refetch: fetchWalletData,
  };
};
