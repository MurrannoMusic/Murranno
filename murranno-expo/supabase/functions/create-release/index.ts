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

    const { 
      title, 
      release_type, 
      release_date, 
      genre, 
      label, 
      cover_art_url,
      upc_ean,
      copyright,
      language
    } = await req.json();

    if (!title || !release_type || !release_date) {
      return new Response(
        JSON.stringify({ error: 'Title, release type, and release date are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating release for user:', user.id);

    // Get user's artist profile
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (artistError) throw artistError;

    if (!artist) {
      return new Response(
        JSON.stringify({ error: 'Artist profile not found. Please create an artist profile first.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create release
    const { data: release, error: createError } = await supabase
      .from('releases')
      .insert({
        artist_id: artist.id,
        title,
        release_type,
        release_date,
        genre: genre || null,
        label: label || null,
        cover_art_url: cover_art_url || null,
        upc_ean: upc_ean || null,
        copyright: copyright || null,
        language: language || null,
        status: 'Draft',
      })
      .select()
      .single();

    if (createError) throw createError;

    console.log('Release created successfully:', release.id);

    return new Response(
      JSON.stringify({ success: true, release }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Create release error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
