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

    const updateData = await req.json();

    console.log('Updating release:', releaseId);

    // Verify user owns this release
    const { data: release, error: fetchError } = await supabase
      .from('releases')
      .select(`
        id,
        artists!inner (
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
      // Check if user is a label managing this artist
      const { data: labelArtist } = await supabase
        .from('label_artists')
        .select('id')
        .eq('artist_id', release.artists.id)
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

    // Build update object with only provided fields
    const updates: any = {};
    const allowedFields = [
      'title', 'release_type', 'release_date', 'genre', 
      'label', 'cover_art_url', 'upc_ean', 'copyright', 
      'language', 'status', 'smartlink'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No fields to update' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update release
    const { data: updatedRelease, error: updateError } = await supabase
      .from('releases')
      .update(updates)
      .eq('id', releaseId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log('Release updated successfully');

    return new Response(
      JSON.stringify({ success: true, release: updatedRelease }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Update release error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
