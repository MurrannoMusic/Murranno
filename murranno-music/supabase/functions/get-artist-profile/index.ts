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
    const artistId = url.searchParams.get('artistId');

    console.log('Fetching artist profile for user:', user.id);

    let query = supabase
      .from('artists')
      .select(`
        *,
        releases:releases(count),
        earnings:earnings(
          amount,
          status
        )
      `);

    // If artistId is provided, fetch specific artist (for label viewing their artists)
    if (artistId) {
      query = query.eq('id', artistId);
      
      // Verify label has access to this artist
      const { data: labelArtist } = await supabase
        .from('label_artists')
        .select('id')
        .eq('artist_id', artistId)
        .eq('label_id', user.id)
        .eq('status', 'active')
        .single();

      if (!labelArtist) {
        return new Response(
          JSON.stringify({ error: 'Access denied' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Fetch user's own artist profile
      query = query.eq('user_id', user.id);
    }

    const { data: artist, error: fetchError } = await query.single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ success: true, artist: null }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw fetchError;
    }

    // Calculate total earnings
    const totalEarnings = artist.earnings?.reduce(
      (sum: number, earning: any) => sum + (earning.status === 'paid' ? parseFloat(earning.amount) : 0),
      0
    ) || 0;

    const pendingEarnings = artist.earnings?.reduce(
      (sum: number, earning: any) => sum + (earning.status === 'pending' ? parseFloat(earning.amount) : 0),
      0
    ) || 0;

    console.log('Artist profile fetched successfully');

    return new Response(
      JSON.stringify({
        success: true,
        artist: {
          ...artist,
          totalEarnings,
          pendingEarnings,
          releaseCount: artist.releases?.[0]?.count || 0,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get artist profile error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
