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
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { campaignId, pause } = await req.json();

    if (!campaignId || pause === undefined) {
      return new Response(
        JSON.stringify({ error: 'campaignId and pause flag are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get campaign to verify ownership
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('status, user_id, name')
      .eq('id', campaignId)
      .single();

    if (fetchError) throw fetchError;

    if (campaign.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Not campaign owner' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine new status
    let newStatus: string;
    if (pause) {
      if (campaign.status !== 'Active') {
        return new Response(
          JSON.stringify({ error: 'Only active campaigns can be paused' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      newStatus = 'Paused';
    } else {
      if (campaign.status !== 'Paused') {
        return new Response(
          JSON.stringify({ error: 'Only paused campaigns can be resumed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      newStatus = 'Active';
    }

    // Update campaign status
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('campaigns')
      .update({ status: newStatus })
      .eq('id', campaignId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log(`Campaign ${pause ? 'paused' : 'resumed'}:`, campaignId);

    return new Response(
      JSON.stringify({ success: true, campaign: updatedCampaign }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Pause campaign error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
