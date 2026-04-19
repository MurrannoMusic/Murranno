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

    const {
      name,
      type,
      platform,
      budget,
      start_date,
      end_date,
      artist_id,
      release_id,
      status,
      promotion_type,
      bundle_id,
      category,
      service_ids,
    } = await req.json();

    console.log('Creating campaign:', { name, type, platform, promotion_type, userId: user.id });

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        user_id: user.id,
        name,
        type,
        platform,
        budget,
        start_date,
        end_date,
        artist_id,
        release_id,
        status: status || 'Draft',
        promotion_type: promotion_type || 'bundle',
        bundle_id,
        category,
        spent: 0,
      })
      .select()
      .single();

    if (campaignError) throw campaignError;

    console.log('Campaign created successfully:', campaign.id);

    return new Response(
      JSON.stringify({ success: true, campaign }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Create campaign error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
