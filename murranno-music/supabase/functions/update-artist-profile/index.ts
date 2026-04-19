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
    // Create Admin Client for DB operations (Bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user from the request authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No Authorization header');
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const updates = await req.json();
    const {
      stage_name,
      bio,
      profile_image,
      spotify_id,
      apple_music_id,
      spotify_url,
      youtube_url,
      audiomack_url,
      soundcloud_url,
      apple_music_url,
      deezer_url,
      tidal_url,
      instagram_url,
      facebook_url,
      tiktok_url,
      twitter_url
    } = updates;

    console.log('Updating artist profile for user:', user.id);

    // Get artist profile
    const { data: artist, error: fetchError } = await supabaseAdmin
      .from('artists')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    let result;

    if (artist) {
      // Update existing profile
      console.log('Updating existing artist profile:', artist.id);
      result = await supabaseAdmin
        .from('artists')
        .update(updates)
        .eq('id', artist.id)
        .select()
        .single();
    } else {
      // Create new profile
      console.log('Creating new artist profile for user:', user.id);
      result = await supabaseAdmin
        .from('artists')
        .insert({
          user_id: user.id,
          ...updates
        })
        .select()
        .single();
    }

    const { data: updatedArtist, error: updateError } = result;

    if (updateError) throw updateError;

    if (updateError) throw updateError;

    console.log('Artist profile updated successfully');

    return new Response(
      JSON.stringify({ success: true, artist: updatedArtist }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Update artist profile error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
