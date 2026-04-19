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

    const { payoutMethodId } = await req.json();

    console.log('Deleting payout method:', payoutMethodId);

    // First, unset as primary if it was
    const { data: method } = await supabase
      .from('payout_methods')
      .select('is_primary')
      .eq('id', payoutMethodId)
      .eq('user_id', user.id)
      .single();

    if (method?.is_primary) {
      // Set another method as primary if one exists
      const { data: otherMethods } = await supabase
        .from('payout_methods')
        .select('id')
        .eq('user_id', user.id)
        .neq('id', payoutMethodId)
        .limit(1);

      if (otherMethods && otherMethods.length > 0) {
        await supabase
          .from('payout_methods')
          .update({ is_primary: true })
          .eq('id', otherMethods[0].id);
      }
    }

    // Delete the payout method
    const { error: deleteError } = await supabase
      .from('payout_methods')
      .delete()
      .eq('id', payoutMethodId)
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;

    console.log('Payout method deleted successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Delete payout method error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
