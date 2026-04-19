import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AgencyCampaignAnalytics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpent: string;
  totalBudget: string;
  totalReach: string;
  totalImpressions: string;
  totalEngagement: string;
  totalClicks: string;
  avgROI: string;
}

export interface CampaignByClient {
  client_id: string;
  artist_name: string;
  campaigns: number;
  spent: string;
  budget: string;
  active: number;
}

export const useAgencyCampaignAnalytics = (clientId?: string) => {
  const [analytics, setAnalytics] = useState<AgencyCampaignAnalytics | null>(null);
  const [campaignsByClient, setCampaignsByClient] = useState<CampaignByClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [clientId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (clientId) params.set('clientId', clientId);

      const { data, error } = await supabase.functions.invoke('get-agency-campaign-analytics', {
        body: { clientId }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch analytics');
      }

      setAnalytics(data.analytics);
      setCampaignsByClient(data.campaignsByClient || []);
    } catch (error: any) {
      console.error('Error fetching agency campaign analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    campaignsByClient,
    loading,
    refetch: fetchAnalytics,
  };
};
