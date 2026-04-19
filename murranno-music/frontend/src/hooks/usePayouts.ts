import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PayoutRequest {
  id: string;
  artist_id: string;
  artist_name: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  requested_at: string;
  approved_at?: string;
  paid_at?: string;
  period_start: string;
  period_end: string;
  streams: number;
  notes?: string;
}

export interface PayoutSummary {
  totalPending: number;
  thisMonth: number;
  totalAvailable: number;
  currency: string;
}

export const usePayouts = () => {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [summary, setSummary] = useState<PayoutSummary>({
    totalPending: 0,
    thisMonth: 0,
    totalAvailable: 0,
    currency: 'NGN'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async (artistId?: string) => {
    try {
      setLoading(true);

      // Fetch earnings breakdown which includes payout information
      const { data, error } = await supabase.functions.invoke('get-earnings-breakdown', {
        body: { 
          period: 30,
          artistId 
        }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch payouts');
      }

      // Transform earnings data to payout format
      // This is a simplified version - you may need to adjust based on actual data structure
      const payoutData: PayoutRequest[] = data.earnings?.map((earning: any) => ({
        id: earning.id,
        artist_id: earning.artist_id,
        artist_name: earning.artist_name || 'Unknown Artist',
        amount: parseFloat(earning.amount),
        currency: earning.currency || 'NGN',
        status: earning.status === 'paid' ? 'paid' : 'pending',
        requested_at: earning.created_at,
        period_start: earning.period_start,
        period_end: earning.period_end,
        streams: earning.streams || 0,
      })) || [];

      setPayouts(payoutData);

      // Calculate summary
      const pending = payoutData
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

      const thisMonth = payoutData
        .filter(p => {
          const date = new Date(p.requested_at);
          const now = new Date();
          return date.getMonth() === now.getMonth() && 
                 date.getFullYear() === now.getFullYear();
        })
        .reduce((sum, p) => sum + p.amount, 0);

      const available = payoutData
        .filter(p => p.status === 'approved' || p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

      setSummary({
        totalPending: pending,
        thisMonth,
        totalAvailable: available,
        currency: 'NGN'
      });

    } catch (error: any) {
      console.error('Error fetching payouts:', error);
      toast.error('Failed to load payout data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPayouts = (artistFilter: string = 'all'): PayoutRequest[] => {
    if (artistFilter === 'all') return payouts;
    return payouts.filter(p => p.artist_id === artistFilter);
  };

  const getTotalPending = (): number => {
    return payouts
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants = {
      'pending': 'default',
      'approved': 'secondary',
      'paid': 'outline',
      'rejected': 'destructive'
    };
    return variants[status as keyof typeof variants] || 'secondary';
  };

  return {
    payouts,
    summary,
    getFilteredPayouts,
    getTotalPending,
    getStatusBadgeVariant,
    loading,
    refetch: fetchPayouts,
  };
};
