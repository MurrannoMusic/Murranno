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
    const period = url.searchParams.get('period') || '30days';
    const artistId = url.searchParams.get('artistId'); // Optional: for labels viewing specific artist

    console.log('Fetching analytics for user:', user.id, 'period:', period, 'artistId:', artistId);

    // Get user's artist profile(s)
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (artistError) throw artistError;

    // Check if user is a label viewing specific artist
    let targetArtistIds: string[] = [];
    
    if (artistId) {
      // Verify label has access to this artist
      const { data: labelArtist } = await supabase
        .from('label_artists')
        .select('artist_id')
        .eq('label_id', user.id)
        .eq('artist_id', artistId)
        .eq('status', 'active')
        .single();

      if (labelArtist) {
        targetArtistIds = [artistId];
      }
    } else if (artist) {
      // User's own artist profile
      targetArtistIds = [artist.id];
    } else {
      // Label viewing all their artists
      const { data: labelArtists } = await supabase
        .from('label_artists')
        .select('artist_id')
        .eq('label_id', user.id)
        .eq('status', 'active');

      if (labelArtists) {
        targetArtistIds = labelArtists.map(la => la.artist_id);
      }
    }

    if (targetArtistIds.length === 0) {
      console.log('No artist profiles found');
      return new Response(
        JSON.stringify({
          totalStreams: 0,
          totalEarnings: 0,
          activeReleases: 0,
          topTracks: [],
          streamsByPlatform: [],
          streamsByCountry: [],
          earningsOverTime: [],
          recentActivity: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get releases
    const { data: releases } = await supabase
      .from('releases')
      .select('id, title, status')
      .in('artist_id', targetArtistIds);

    const activeReleases = releases?.filter(r => r.status === 'Live').length || 0;

    // Get tracks
    const releaseIds = releases?.map(r => r.id) || [];
    const { data: tracks } = await supabase
      .from('tracks')
      .select('id, title, release_id')
      .in('release_id', releaseIds);

    const trackIds = tracks?.map(t => t.id) || [];

    // Get streaming data
    const { data: streamingData } = await supabase
      .from('streaming_data')
      .select('*')
      .in('track_id', trackIds)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    // Calculate total streams
    const totalStreams = streamingData?.reduce((sum, s) => sum + (s.streams || 0), 0) || 0;

    // Get earnings
    const { data: earnings } = await supabase
      .from('earnings')
      .select('*')
      .in('artist_id', targetArtistIds)
      .gte('period_start', startDate.toISOString().split('T')[0])
      .lte('period_end', endDate.toISOString().split('T')[0]);

    const totalEarnings = earnings?.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0) || 0;

    // Top tracks by streams
    const trackStreamsMap = new Map<string, number>();
    streamingData?.forEach(sd => {
      const current = trackStreamsMap.get(sd.track_id) || 0;
      trackStreamsMap.set(sd.track_id, current + (sd.streams || 0));
    });

    const topTracks = Array.from(trackStreamsMap.entries())
      .map(([trackId, streams]) => {
        const track = tracks?.find(t => t.id === trackId);
        const release = releases?.find(r => r.id === track?.release_id);
        return {
          id: trackId,
          title: track?.title || 'Unknown',
          artist: 'Artist',
          streams,
          release: release?.title || 'Unknown',
        };
      })
      .sort((a, b) => b.streams - a.streams)
      .slice(0, 10);

    // Streams by platform
    const platformStreamsMap = new Map<string, number>();
    streamingData?.forEach(sd => {
      const current = platformStreamsMap.get(sd.platform) || 0;
      platformStreamsMap.set(sd.platform, current + (sd.streams || 0));
    });

    const streamsByPlatform = Array.from(platformStreamsMap.entries())
      .map(([platform, streams]) => ({
        platform,
        streams,
        percentage: totalStreams > 0 ? Math.round((streams / totalStreams) * 100) : 0,
      }))
      .sort((a, b) => b.streams - a.streams);

    // Streams by country
    const countryStreamsMap = new Map<string, number>();
    streamingData?.forEach(sd => {
      if (sd.country && sd.country !== '') {
        const current = countryStreamsMap.get(sd.country) || 0;
        countryStreamsMap.set(sd.country, current + (sd.streams || 0));
      }
    });

    const streamsByCountry = Array.from(countryStreamsMap.entries())
      .map(([country, streams]) => ({
        country,
        streams,
        percentage: totalStreams > 0 ? Math.round((streams / totalStreams) * 100) : 0,
      }))
      .sort((a, b) => b.streams - a.streams)
      .slice(0, 10);

    // Earnings over time (daily)
    const earningsMap = new Map<string, number>();
    earnings?.forEach(e => {
      const date = e.period_end;
      const current = earningsMap.get(date) || 0;
      earningsMap.set(date, current + parseFloat(e.amount.toString()));
    });

    const earningsOverTime = Array.from(earningsMap.entries())
      .map(([date, amount]) => ({
        date,
        amount: Math.round(amount * 100) / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Recent activity (last 10 streaming data points)
    const recentActivity = streamingData
      ?.sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10)
      .map(sd => {
        const track = tracks?.find(t => t.id === sd.track_id);
        return {
          date: sd.date,
          type: 'stream',
          description: `${sd.streams} streams on ${sd.platform}`,
          track: track?.title || 'Unknown',
          platform: sd.platform,
        };
      }) || [];

    console.log('Analytics fetched successfully');

    return new Response(
      JSON.stringify({
        totalStreams,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        activeReleases,
        topTracks,
        streamsByPlatform,
        streamsByCountry,
        earningsOverTime,
        recentActivity,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fetch analytics error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
