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
    const period = url.searchParams.get('period') || '30'; // days
    const artistId = url.searchParams.get('artistId');

    console.log('Fetching analytics data for user:', user.id);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Build query based on user type
    let artistIds: string[] = [];

    if (artistId) {
      // Verify user has access to this artist
      const { data: artist } = await supabase
        .from('artists')
        .select('id')
        .eq('id', artistId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!artist) {
        // Check if user is a label with access to this artist
        const { data: labelArtist } = await supabase
          .from('label_artists')
          .select('artist_id')
          .eq('artist_id', artistId)
          .eq('label_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (!labelArtist) {
          return new Response(
            JSON.stringify({ error: 'Access denied' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      artistIds = [artistId];
    } else {
      // Get all artists user has access to
      const { data: userArtist } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userArtist) {
        artistIds.push(userArtist.id);
      }

      // If label, get their managed artists
      const { data: labelArtists } = await supabase
        .from('label_artists')
        .select('artist_id')
        .eq('label_id', user.id)
        .eq('status', 'active');

      if (labelArtists) {
        artistIds.push(...labelArtists.map(la => la.artist_id));
      }
    }

    if (artistIds.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          streams: [],
          totalStreams: 0,
          earnings: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get streaming data
    const { data: streamingData, error: streamError } = await supabase
      .from('streaming_data')
      .select(`
        date,
        streams,
        platform,
        country,
        track_id,
        tracks (
          id,
          title,
          release_id,
          releases (
            artist_id,
            title
          )
        )
      `)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .in('tracks.releases.artist_id', artistIds);

    if (streamError) throw streamError;

    // Aggregate streams by date, platform, country, and track
    const streamsByDate: any = {};
    const streamsByPlatform: any = {};
    const streamsByCountry: any = {};
    const streamsByTrack: any = {};
    let totalStreams = 0;

    streamingData?.forEach((data: any) => {
      const streams = parseInt(data.streams);
      totalStreams += streams;

      // By date
      if (!streamsByDate[data.date]) {
        streamsByDate[data.date] = 0;
      }
      streamsByDate[data.date] += streams;

      // By platform
      if (!streamsByPlatform[data.platform]) {
        streamsByPlatform[data.platform] = 0;
      }
      streamsByPlatform[data.platform] += streams;

      // By country
      if (data.country) {
        if (!streamsByCountry[data.country]) {
          streamsByCountry[data.country] = 0;
        }
        streamsByCountry[data.country] += streams;
      }

      // By track
      if (data.tracks) {
        const trackId = data.tracks.id;
        if (!streamsByTrack[trackId]) {
          streamsByTrack[trackId] = {
            id: trackId,
            title: data.tracks.title,
            release: data.tracks.releases?.title || 'Unknown',
            streams: 0,
          };
        }
        streamsByTrack[trackId].streams += streams;
      }
    });

    // Get top tracks
    const topTracks = Object.values(streamsByTrack)
      .sort((a: any, b: any) => b.streams - a.streams)
      .slice(0, 10);

    // Get best platform
    const bestPlatform = Object.entries(streamsByPlatform)
      .sort(([, a]: any, [, b]: any) => b - a)[0];

    // Get top country
    const topCountry = Object.entries(streamsByCountry)
      .sort(([, a]: any, [, b]: any) => b - a)[0];

    // Get earnings data
    const { data: earnings, error: earningsError } = await supabase
      .from('earnings')
      .select('amount')
      .in('artist_id', artistIds)
      .gte('period_start', startDate.toISOString().split('T')[0])
      .lte('period_end', endDate.toISOString().split('T')[0]);

    if (earningsError) throw earningsError;

    const totalEarnings = earnings?.reduce(
      (sum, e) => sum + parseFloat(e.amount),
      0
    ) || 0;

    console.log('Analytics data fetched successfully');

    return new Response(
      JSON.stringify({
        success: true,
        streamsByDate,
        streamsByPlatform,
        streamsByCountry,
        totalStreams,
        totalEarnings,
        topTracks,
        bestPlatform: bestPlatform ? { name: bestPlatform[0], streams: bestPlatform[1] } : null,
        topCountry: topCountry ? { name: topCountry[0], streams: topCountry[1] } : null,
        period: parseInt(period),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get analytics data error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
