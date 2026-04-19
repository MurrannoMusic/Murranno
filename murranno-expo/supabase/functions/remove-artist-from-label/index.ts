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

    const { artistId, permanent } = await req.json();

    console.log('Removing artist from label:', artistId, 'permanent:', permanent);

    if (permanent) {
      // Permanently delete the relationship
      const { error: deleteError } = await supabase
        .from('label_artists')
        .delete()
        .eq('label_id', user.id)
        .eq('artist_id', artistId);

      if (deleteError) throw deleteError;
    } else {
      // Just mark as inactive
      const { error: updateError } = await supabase
        .from('label_artists')
        .update({ status: 'inactive' })
        .eq('label_id', user.id)
        .eq('artist_id', artistId);

      if (updateError) throw updateError;
    }

    console.log('Artist removed successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Remove artist error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
