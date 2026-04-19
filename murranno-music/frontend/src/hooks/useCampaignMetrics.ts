import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CampaignMetric {
  id: string;
  campaign_id: string;
  date: string;
  reach: number;
  impressions: number;
  engagement: number;
  clicks: number;
  conversions: number;
  spend: number;
}

export const useCampaignMetrics = (campaignId: string) => {
  const [metrics, setMetrics] = useState<CampaignMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campaignId) return;
    
    fetchMetrics();
  }, [campaignId]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaign_metrics')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('date', { ascending: true });

      if (error) throw error;

      setMetrics(data || []);
    } catch (error: any) {
      console.error('Error fetching campaign metrics:', error);
      toast.error('Failed to load campaign metrics');
    } finally {
      setLoading(false);
    }
  };

  const getTotalMetrics = () => {
    if (!metrics.length) return null;

    return {
      totalReach: metrics.reduce((sum, m) => sum + (m.reach || 0), 0),
      totalImpressions: metrics.reduce((sum, m) => sum + (m.impressions || 0), 0),
      totalEngagement: metrics.reduce((sum, m) => sum + (m.engagement || 0), 0),
      totalClicks: metrics.reduce((sum, m) => sum + (m.clicks || 0), 0),
      totalConversions: metrics.reduce((sum, m) => sum + (m.conversions || 0), 0),
      totalSpend: metrics.reduce((sum, m) => sum + (m.spend || 0), 0),
    };
  };

  return {
    metrics,
    loading,
    refetch: fetchMetrics,
    getTotalMetrics,
  };
};
