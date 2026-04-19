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

    // Check if user has admin role
    const { data: isAdmin, error: roleError } = await supabase.rpc('has_admin_role', {
      _user_id: user.id
    });

    if (roleError || !isAdmin) {
      console.error('Authorization error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { page = 1, limit = 20, search, status } = await req.json();
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('campaigns')
      .select(`
        *,
        artists:artist_id (
          id,
          stage_name
        ),
        releases:release_id (
          id,
          title
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,platform.ilike.%${search}%`);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: campaigns, error: campaignsError, count } = await query;

    if (campaignsError) throw campaignsError;

    // Format campaigns data
    const formattedCampaigns = campaigns?.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      artist: campaign.artists?.stage_name || 'Unknown Artist',
      type: campaign.type,
      platform: campaign.platform,
      status: campaign.status,
      budget: campaign.budget,
      spent: campaign.spent,
      reach: '0', // Can be calculated from metrics
      engagement: '0', // Can be calculated from metrics
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      paymentStatus: campaign.payment_status,
      paymentAmount: campaign.payment_amount,
      paymentReference: campaign.payment_reference,
      campaignAssets: campaign.campaign_assets,
      campaignBrief: campaign.campaign_brief,
      targetAudience: campaign.target_audience,
      socialLinks: campaign.social_links,
      adminNotes: campaign.admin_notes,
      rejectionReason: campaign.rejection_reason,
    })) || [];

    const totalPages = Math.ceil((count || 0) / limit);

    console.log(`Retrieved ${campaigns?.length || 0} campaigns for admin`);

    return new Response(
      JSON.stringify({
        success: true,
        campaigns: formattedCampaigns,
        total: count || 0,
        page,
        totalPages,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get campaigns error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
