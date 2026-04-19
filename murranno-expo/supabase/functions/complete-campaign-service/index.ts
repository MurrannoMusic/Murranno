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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('tier')
      .eq('user_id', user.id)
      .single();

    if (!userRole || userRole.tier !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { campaignServiceId, notes, status } = await req.json();

    if (!campaignServiceId) {
      return new Response(
        JSON.stringify({ error: 'campaignServiceId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update campaign service status
    const { data: campaignService, error: updateError } = await supabase
      .from('campaign_services')
      .update({
        status: status || 'completed',
        completed_at: new Date().toISOString(),
        notes: notes || null
      })
      .eq('id', campaignServiceId)
      .select('*, campaign_id')
      .single();

    if (updateError) throw updateError;

    // Get campaign details for notification
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('user_id, name')
      .eq('id', campaignService.campaign_id)
      .single();

    if (campaignError) throw campaignError;

    // Send notification to user
    await supabase.functions.invoke('send-campaign-notification', {
      body: {
        userId: campaign.user_id,
        title: 'Service Completed',
        message: `A service for your campaign "${campaign.name}" has been completed.`,
        type: 'campaign',
        relatedType: 'campaign',
        relatedId: campaignService.campaign_id
      }
    });

    console.log('Campaign service completed:', campaignServiceId);

    return new Response(
      JSON.stringify({ success: true, campaignService }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Complete campaign service error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
