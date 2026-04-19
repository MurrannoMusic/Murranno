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

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const {
      stageName,
      email,
      revenueSharePercentage,
      contractStartDate,
      contractEndDate,
    } = await req.json();

    console.log('Adding artist to label:', user.id, 'stageName:', stageName);

    // Check user's subscription tier and current artist count
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('tier')
      .eq('user_id', user.id)
      .single();

    if (!userRole) {
      throw new Error('User role not found');
    }

    // Get subscription plan limits
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('max_artists')
      .eq('tier', userRole.tier)
      .single();

    // Count current artists
    const { count: currentArtistCount } = await supabase
      .from('label_artists')
      .select('*', { count: 'exact', head: true })
      .eq('label_id', user.id)
      .eq('status', 'active');

    if (plan?.max_artists && currentArtistCount !== null && currentArtistCount >= plan.max_artists) {
      return new Response(
        JSON.stringify({
          error: 'Artist limit reached',
          message: `Your ${userRole.tier} plan allows up to ${plan.max_artists} artists. Please upgrade to add more.`,
          limit: plan.max_artists,
          current: currentArtistCount,
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create artist profile
    const { data: newArtist, error: artistError } = await supabase
      .from('artists')
      .insert({
        stage_name: stageName,
      })
      .select()
      .single();

    if (artistError) throw artistError;

    // Link artist to label
    const { data: labelArtist, error: linkError } = await supabase
      .from('label_artists')
      .insert({
        label_id: user.id,
        artist_id: newArtist.id,
        status: 'active',
        revenue_share_percentage: revenueSharePercentage,
        contract_start_date: contractStartDate,
        contract_end_date: contractEndDate,
      })
      .select()
      .single();

    if (linkError) throw linkError;

    console.log('Artist added successfully:', newArtist.id);

    return new Response(
      JSON.stringify({
        success: true,
        artist: {
          id: newArtist.id,
          stageName: newArtist.stage_name,
          ...labelArtist,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Add artist error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
