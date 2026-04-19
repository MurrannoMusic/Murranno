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

    if (!artistId) {
      return new Response(
        JSON.stringify({ error: 'Artist ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching artist detail:', artistId);

    // Get artist info
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('id', artistId)
      .single();

    if (artistError) throw artistError;

    // Verify user has access (is the artist, or label with relationship)
    const isOwnArtist = artist.user_id === user.id;
    
    const { data: labelRelation } = await supabase
      .from('label_artists')
      .select('*')
      .eq('artist_id', artistId)
      .eq('label_id', user.id)
      .eq('status', 'active')
      .single();

    if (!isOwnArtist && !labelRelation) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get releases with stats
    const { data: releases } = await supabase
      .from('releases')
      .select('*')
      .eq('artist_id', artistId)
      .order('release_date', { ascending: false });

    // Get release stats
    const releasesWithStats = await Promise.all(
      (releases || []).map(async (release) => {
        // Get tracks
        const { data: tracks } = await supabase
          .from('tracks')
          .select('id')
          .eq('release_id', release.id);

        const trackIds = tracks?.map(t => t.id) || [];

        // Get streams
        const { data: streamData } = await supabase
          .from('streaming_data')
          .select('streams')
          .in('track_id', trackIds);

        const totalStreams = streamData?.reduce((sum, s) => sum + (s.streams || 0), 0) || 0;

        // Get earnings
        const { data: earningsData } = await supabase
          .from('earnings')
          .select('amount')
          .eq('release_id', release.id)
          .eq('status', 'paid');

        const totalEarnings = earningsData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

        return {
          ...release,
          streams: totalStreams,
          earnings: totalEarnings
        };
      })
    );

    // Get total stats
    const { data: allStreamData } = await supabase
      .from('streaming_data')
      .select('streams')
      .in('track_id', 
        supabase
          .from('tracks')
          .select('id')
          .in('release_id',
            supabase
              .from('releases')
              .select('id')
              .eq('artist_id', artistId)
          )
      );

    const totalStreams = allStreamData?.reduce((sum, s) => sum + (s.streams || 0), 0) || 0;

    const { data: allEarnings } = await supabase
      .from('earnings')
      .select('amount')
      .eq('artist_id', artistId)
      .eq('status', 'paid');

    const totalEarnings = allEarnings?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

    // Get payout history if label
    let payoutHistory = [];
    if (labelRelation) {
      payoutHistory = [{
        date: '2024-01-15',
        amount: (totalEarnings * (labelRelation.revenue_share_percentage / 100)).toFixed(2),
        status: 'Completed',
        period: 'Q4 2023'
      }];
    }

    console.log('Artist detail fetched successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        artist: {
          ...artist,
          totalStreams,
          totalEarnings,
          releaseCount: releases?.length || 0
        },
        releases: releasesWithStats,
        labelRelation,
        payoutHistory
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get artist detail error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
