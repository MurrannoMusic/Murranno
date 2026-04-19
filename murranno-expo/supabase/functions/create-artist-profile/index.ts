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

    const { stage_name, bio, profile_image, spotify_id, apple_music_id } = await req.json();

    if (!stage_name) {
      return new Response(
        JSON.stringify({ error: 'Stage name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating artist profile for user:', user.id);

    // Check if artist profile already exists
    const { data: existingArtist } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingArtist) {
      return new Response(
        JSON.stringify({ error: 'Artist profile already exists' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create artist profile
    const { data: artist, error: createError } = await supabase
      .from('artists')
      .insert({
        user_id: user.id,
        stage_name,
        bio: bio || null,
        profile_image: profile_image || null,
        spotify_id: spotify_id || null,
        apple_music_id: apple_music_id || null,
      })
      .select()
      .single();

    if (createError) throw createError;

    console.log('Artist profile created successfully:', artist.id);

    return new Response(
      JSON.stringify({ success: true, artist }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Create artist profile error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
