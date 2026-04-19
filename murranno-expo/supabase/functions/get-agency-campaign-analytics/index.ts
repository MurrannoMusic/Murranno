import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const clientId = url.searchParams.get('clientId');

    console.log('Fetching agency campaign analytics for:', user.id);

    // Get all client IDs for this agency
    const { data: agencyClients } = await supabase
      .from('agency_clients')
      .select('client_id, artists:client_id(id)')
      .eq('agency_id', user.id)
      .eq('status', 'active');

    if (!agencyClients || agencyClients.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          analytics: {
            totalCampaigns: 0,
            activeCampaigns: 0,
            totalSpent: '0',
            totalReach: '0',
            totalImpressions: '0',
            totalEngagement: '0',
            avgROI: '0'
          },
          campaignsByClient: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const artistIds = agencyClients.map(c => c.artists?.id).filter(Boolean);

    // Build campaigns query
    let campaignsQuery = supabase
      .from('campaigns')
      .select(`
        *,
        artists:artist_id(id, stage_name)
      `)
      .in('artist_id', artistIds);

    if (clientId) {
      // Filter to specific client's artist
      const clientArtist = agencyClients.find(c => c.client_id === clientId);
      if (clientArtist?.artists?.id) {
        campaignsQuery = campaignsQuery.eq('artist_id', clientArtist.artists.id);
      }
    }

    const { data: campaigns } = await campaignsQuery;

    const totalCampaigns = campaigns?.length || 0;
    const activeCampaigns = campaigns?.filter(c => c.status === 'Active').length || 0;
    const totalSpent = campaigns?.reduce((sum, c) => sum + parseFloat(c.spent || 0), 0) || 0;
    const totalBudget = campaigns?.reduce((sum, c) => sum + parseFloat(c.budget || 0), 0) || 0;

    // Get metrics for all campaigns
    const campaignIds = campaigns?.map(c => c.id) || [];
    const { data: metrics } = await supabase
      .from('campaign_metrics')
      .select('*')
      .in('campaign_id', campaignIds);

    const totalReach = metrics?.reduce((sum, m) => sum + (m.reach || 0), 0) || 0;
    const totalImpressions = metrics?.reduce((sum, m) => sum + (m.impressions || 0), 0) || 0;
    const totalEngagement = metrics?.reduce((sum, m) => sum + (m.engagement || 0), 0) || 0;
    const totalClicks = metrics?.reduce((sum, m) => sum + (m.clicks || 0), 0) || 0;

    // Calculate ROI
    const avgROI = totalSpent > 0 ? ((totalReach / totalSpent) * 100).toFixed(2) : '0';

    // Group campaigns by client
    const campaignsByClient = agencyClients.map(client => {
      const clientCampaigns = campaigns?.filter(c => c.artist_id === client.artists?.id) || [];
      const clientSpent = clientCampaigns.reduce((sum, c) => sum + parseFloat(c.spent || 0), 0);
      const clientBudget = clientCampaigns.reduce((sum, c) => sum + parseFloat(c.budget || 0), 0);

      return {
        client_id: client.client_id,
        artist_name: client.artists?.stage_name || 'Unknown',
        campaigns: clientCampaigns.length,
        spent: clientSpent.toFixed(2),
        budget: clientBudget.toFixed(2),
        active: clientCampaigns.filter(c => c.status === 'Active').length
      };
    });

    console.log('Analytics calculated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        analytics: {
          totalCampaigns,
          activeCampaigns,
          totalSpent: totalSpent.toFixed(2),
          totalBudget: totalBudget.toFixed(2),
          totalReach: totalReach.toString(),
          totalImpressions: totalImpressions.toString(),
          totalEngagement: totalEngagement.toString(),
          totalClicks: totalClicks.toString(),
          avgROI
        },
        campaignsByClient
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get agency campaign analytics error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
