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

    const { tier } = await req.json();

    if (!tier) {
      return new Response(
        JSON.stringify({ error: 'Tier is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Updating tier for user:', user.id, 'to:', tier);

    // Verify the tier exists
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('tier, max_artists')
      .eq('tier', tier)
      .maybeSingle();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Invalid subscription tier' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has label artists and if new tier allows it
    if (tier === 'artist' || tier === 'manager') {
      const { data: labelArtists, error: artistsError } = await supabase
        .from('label_artists')
        .select('id')
        .eq('label_id', user.id)
        .eq('status', 'active');

      if (artistsError) throw artistsError;

      if (labelArtists && labelArtists.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Cannot downgrade tier while managing artists. Please remove artists first.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update user role
    const { error: roleError } = await supabase
      .from('user_roles')
      .update({ tier })
      .eq('user_id', user.id);

    if (roleError) throw roleError;

    // Update subscription tier (this will be handled by Paystack webhook for paid upgrades)
    // For now, we just update the tier
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .update({ tier })
      .eq('user_id', user.id)
      .select()
      .maybeSingle();

    if (subError) throw subError;

    console.log('Tier updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        subscription,
        message: 'Tier updated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Update tier error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
