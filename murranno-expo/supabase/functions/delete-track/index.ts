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
    const releaseId = url.searchParams.get('releaseId');
    const trackId = url.searchParams.get('trackId');

    if (!releaseId || !trackId) {
      return new Response(
        JSON.stringify({ error: 'Release ID and Track ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Deleting track:', trackId, 'from release:', releaseId);

    // Verify user owns this track
    const { data: track, error: fetchError } = await supabase
      .from('tracks')
      .select(`
        id,
        releases!inner (
          id,
          artists!inner (
            user_id
          )
        )
      `)
      .eq('id', trackId)
      .eq('release_id', releaseId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!track) {
      return new Response(
        JSON.stringify({ error: 'Track not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // @ts-ignore - nested objects in response
    if (track.releases.artists.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete track
    const { error: deleteError } = await supabase
      .from('tracks')
      .delete()
      .eq('id', trackId);

    if (deleteError) throw deleteError;

    console.log('Track deleted successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Track deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Delete track error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
