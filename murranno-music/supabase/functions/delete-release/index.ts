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
    const releaseId = url.searchParams.get('id');

    if (!releaseId) {
      return new Response(
        JSON.stringify({ error: 'Release ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Deleting release:', releaseId);

    // Verify user owns this release
    const { data: release, error: fetchError } = await supabase
      .from('releases')
      .select(`
        id,
        artists!inner (
          id,
          user_id
        )
      `)
      .eq('id', releaseId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!release) {
      return new Response(
        JSON.stringify({ error: 'Release not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // @ts-ignore - artists is an object in the response
    if (release.artists.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if release has campaigns
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id')
      .eq('release_id', releaseId)
      .limit(1);

    if (campaigns && campaigns.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Cannot delete release with active campaigns. Please delete campaigns first.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete release (cascade will delete tracks)
    const { error: deleteError } = await supabase
      .from('releases')
      .delete()
      .eq('id', releaseId);

    if (deleteError) throw deleteError;

    console.log('Release deleted successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Release deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Delete release error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
