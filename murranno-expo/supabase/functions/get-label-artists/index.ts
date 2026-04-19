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

    const url = new URL(req.url);
    const statusFilter = url.searchParams.get('status') || 'active';

    console.log('Fetching label artists for:', user.id, 'status:', statusFilter);

    // Get label's artists
    let query = supabase
      .from('label_artists')
      .select(`
        *,
        artist:artists!inner(
          id,
          stage_name,
          profile_image,
          bio
        )
      `)
      .eq('label_id', user.id)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: labelArtists, error: fetchError } = await query;

    if (fetchError) throw fetchError;

    // Get stats for each artist
    const artistsWithStats = await Promise.all(
      (labelArtists || []).map(async (la) => {
        // Get release count
        const { count: releaseCount } = await supabase
          .from('releases')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', la.artist_id);

        // Get total streams
        const { data: tracks } = await supabase
          .from('tracks')
          .select('id')
          .in('release_id', 
            (await supabase
              .from('releases')
              .select('id')
              .eq('artist_id', la.artist_id)
            ).data?.map(r => r.id) || []
          );

        const trackIds = tracks?.map(t => t.id) || [];
        
        const { data: streamingData } = await supabase
          .from('streaming_data')
          .select('streams')
          .in('track_id', trackIds);

        const totalStreams = streamingData?.reduce((sum, s) => sum + (s.streams || 0), 0) || 0;

        // Get total earnings
        const { data: earnings } = await supabase
          .from('earnings')
          .select('amount')
          .eq('artist_id', la.artist_id);

        const totalEarnings = earnings?.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0) || 0;

        return {
          id: la.artist_id,
          name: la.artist.stage_name,
          stageName: la.artist.stage_name,
          profileImage: la.artist.profile_image,
          status: la.status,
          revenueShare: la.revenue_share_percentage,
          contractStartDate: la.contract_start_date,
          contractEndDate: la.contract_end_date,
          stats: {
            releases: releaseCount || 0,
            streams: totalStreams,
            earnings: Math.round(totalEarnings * 100) / 100,
          },
        };
      })
    );

    console.log('Fetched label artists:', artistsWithStats.length);

    return new Response(
      JSON.stringify({ artists: artistsWithStats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get label artists error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
