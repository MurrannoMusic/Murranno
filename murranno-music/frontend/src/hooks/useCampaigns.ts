import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Campaign, CampaignStats } from '@/types/campaign';
import { toast } from 'sonner';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSpent: '0',
    totalReach: '0',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async (status?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-user-campaigns', {
        body: { status }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch campaigns');
      }

      setCampaigns(data.campaigns || []);
      setStats(data.stats || {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalSpent: '0',
        totalReach: '0',
      });
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCampaigns = (statusFilter: string = 'all'): Campaign[] => {
    if (statusFilter === 'all') return campaigns;
    return campaigns.filter(c => c.status === statusFilter);
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants = {
      'Active': 'default',
      'Completed': 'secondary',
      'Paused': 'outline',
      'Draft': 'outline'
    };
    return variants[status as keyof typeof variants] || 'secondary';
  };

  const getPlatformIcon = (platform: string) => {
    return platform;
  };

  return {
    campaigns,
    stats,
    getFilteredCampaigns,
    getStatusBadgeVariant,
    getPlatformIcon,
    loading,
    refetch: fetchCampaigns,
  };
};