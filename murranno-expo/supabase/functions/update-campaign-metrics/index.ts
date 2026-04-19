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

    const { campaignId, date, reach, impressions, engagement, clicks, conversions, spend } = await req.json();

    if (!campaignId || !date) {
      return new Response(
        JSON.stringify({ error: 'campaignId and date are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert metrics (update if exists, insert if not)
    const { data, error } = await supabase
      .from('campaign_metrics')
      .upsert({
        campaign_id: campaignId,
        date,
        reach: reach || 0,
        impressions: impressions || 0,
        engagement: engagement || 0,
        clicks: clicks || 0,
        conversions: conversions || 0,
        spend: spend || 0,
      }, {
        onConflict: 'campaign_id,date'
      })
      .select()
      .single();

    if (error) throw error;

    console.log('Campaign metrics updated:', data.id);

    return new Response(
      JSON.stringify({ success: true, metrics: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Update campaign metrics error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
