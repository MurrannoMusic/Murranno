import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {errorMessage} from '@/lib/api';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Campaign, CampaignStats } from '@/types/campaign';
import { Alert } from 'react-native';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSpent: '0',
    totalReach: '0',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  const fetchCampaigns = useCallback(async (status?: string) => {
    try {
      setLoading(true); setError(null);
      const { data, error } = await supabase.functions.invoke('get-user-campaigns', {
        body: { status }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch campaigns');
      }

      setCampaigns((data.campaigns || []).map((c: any) => ({...c, artist: c.artist || c.artists?.stage_name || 'Artist', budget: Number(c.budget || 0).toLocaleString(), spent: Number(c.spent || 0).toLocaleString(), reach: Number(c.reach || 0).toLocaleString(), engagement: `${Number(c.engagement || 0).toFixed(1)}%`, startDate: c.startDate || c.start_date, endDate: c.endDate || c.end_date, paymentStatus: c.paymentStatus || c.payment_status, paymentReference: c.paymentReference || c.payment_reference, paymentAmount: c.paymentAmount ?? c.payment_amount, campaignAssets: c.campaignAssets || c.campaign_assets, campaignBrief: c.campaignBrief || c.campaign_brief, targetAudience: c.targetAudience || c.target_audience, socialLinks: c.socialLinks || c.social_links, adminNotes: c.adminNotes || c.admin_notes, rejectionReason: c.rejectionReason || c.rejection_reason})));
      setStats(data.stats || {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalSpent: '0',
        totalReach: '0',
      });
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      setError(await errorMessage(error, 'Failed to load campaigns'));
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { void fetchCampaigns(); }, [fetchCampaigns]));

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
    error,
    refetch: fetchCampaigns,
  };
};
