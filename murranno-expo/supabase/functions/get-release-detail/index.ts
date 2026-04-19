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

    // Parse body parameters
    const { releaseId, id } = await req.json();
    const targetId = releaseId || id;

    if (!targetId) {
      return new Response(
        JSON.stringify({ error: 'Release ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching release detail:', targetId);

    // Fetch release with tracks
    const { data: release, error: releaseError } = await supabase
      .from('releases')
      .select(`
        *,
        artist:artists!inner(stage_name, user_id),
        tracks(
          *
        )
      `)
      .eq('id', targetId)
      .single();

    if (releaseError) {
      console.error('Release fetch error:', releaseError);
      throw releaseError;
    }

    // Verify user has access to this release
    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const hasAccess = release.artist.user_id === user.id;

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform to match frontend format (ReleaseDetail interface)
    const transformedRelease = {
      id: release.id,
      title: release.title,
      artist_name: release.artist.stage_name,
      release_type: release.release_type, // Frontend expects snake_case
      release_date: release.release_date, // Frontend expects snake_case
      cover_art_url: release.cover_art_url || '/placeholder.svg',
      status: release.status,

      recording_year: release.recording_year || new Date(release.release_date).getFullYear().toString(),

      // Flattened metadata
      genre: release.genre || '',
      language: release.language || '',
      label: release.label || '',
      copyright: release.copyright_holder || release.copyright || '',
      upc_ean: release.upc || release.upc_ean || '',
      isrc: release.isrc || '',

      smartlink: release.smartlink || '',

      // Default analytics values (missing from DB currently)
      total_streams: 0,
      total_earnings: 0,

      tracks: release.tracks?.map((track: any) => ({
        id: track.id,
        title: track.title,
        duration: track.duration,
        isrc: track.isrc,
        track_number: track.track_number, // Frontend expects snake_case
        streams: 0, // Default to 0
        audioFileUrl: track.audio_file_url, // Keep as is if used by player?
        // Frontend Track interface: id, title, duration, track_number, isrc, streams.
      })) || [],
    };

    console.log('Release detail fetched successfully');

    return new Response(
      JSON.stringify({
        success: true,
        release: transformedRelease
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get release detail error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
