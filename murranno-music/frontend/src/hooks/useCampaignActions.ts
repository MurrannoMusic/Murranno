import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useCampaignActions = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const pauseCampaign = async (campaignId: string, currentStatus: string) => {
    try {
      setLoading(true);
      const pause = currentStatus === 'Active';

      const { data, error } = await supabase.functions.invoke('pause-campaign', {
        body: {
          campaignId,
          pause,
        }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to update campaign status');
      }

      toast.success(`Campaign ${pause ? 'paused' : 'resumed'} successfully`);
      return true;
    } catch (error: any) {
      console.error('Error updating campaign status:', error);
      toast.error(error.message || 'Failed to update campaign status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const duplicateCampaign = async (campaignId: string) => {
    try {
      setLoading(true);

      // Fetch the original campaign
      const { data: originalCampaign, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (fetchError) throw fetchError;

      // Create duplicate
      const { data, error } = await supabase.functions.invoke('create-campaign', {
        body: {
          name: `${originalCampaign.name} (Copy)`,
          type: originalCampaign.type,
          platform: originalCampaign.platform,
          release_id: originalCampaign.release_id,
          budget: originalCampaign.budget,
          start_date: new Date().toISOString().split('T')[0],
          status: 'Draft',
        }
      });

      if (error) throw error;

      toast.success('Campaign duplicated successfully');
      return true;
    } catch (error: any) {
      console.error('Error duplicating campaign:', error);
      toast.error('Failed to duplicate campaign');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const viewAnalytics = (campaignId: string) => {
    navigate(`/results?campaign=${campaignId}`);
  };

  const editCampaign = (campaignId: string) => {
    // For now, just show a toast. In a full implementation, this would open an edit dialog
    toast.info('Edit functionality coming soon');
  };

  return {
    pauseCampaign,
    duplicateCampaign,
    viewAnalytics,
    editCampaign,
    loading,
  };
};
