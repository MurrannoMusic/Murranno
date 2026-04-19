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
    const statusFilter = url.searchParams.get('status');
    const searchQuery = url.searchParams.get('search');

    console.log('Fetching releases for user:', user.id);
    console.log('Filters - status:', statusFilter, 'search:', searchQuery);

    // Get user's artist profile
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (artistError) throw artistError;

    if (!artist) {
      console.log('No artist profile found for user');
      return new Response(
        JSON.stringify({ success: true, releases: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build query for releases
    let query = supabase
      .from('releases')
      .select(`
        *,
        artist:artists!inner(stage_name),
        tracks(*)
      `)
      .eq('artist_id', artist.id)
      .order('created_at', { ascending: false });

    // Apply status filter
    if (statusFilter && statusFilter !== 'All') {
      query = query.eq('status', statusFilter);
    }

    // Apply search filter
    if (searchQuery && searchQuery.trim() !== '') {
      query = query.ilike('title', `%${searchQuery}%`);
    }

    const { data: releases, error: releasesError } = await query;

    if (releasesError) {
      console.error('Releases fetch error:', releasesError);
      throw releasesError;
    }

    console.log('Fetched releases:', releases?.length);

    // Transform to match frontend format
    const transformedReleases = releases?.map(release => ({
      id: release.id,
      title: release.title,
      artist: release.artist.stage_name,
      type: release.release_type,
      year: new Date(release.release_date).getFullYear(),
      releaseDate: release.release_date,
      coverArt: release.cover_art_url || '/placeholder.svg',
      status: release.status,
      metadata: {
        genre: release.genre || '',
        language: release.language || '',
        label: release.label || '',
        copyright: release.copyright || '',
        upcEan: release.upc_ean || '',
      },
      smartlink: release.smartlink || '',
      tracks: release.tracks || [],
    })) || [];

    return new Response(
      JSON.stringify({ success: true, releases: transformedReleases }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get releases error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
