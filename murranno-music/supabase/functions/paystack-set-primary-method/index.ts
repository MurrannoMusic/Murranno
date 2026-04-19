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

    console.log('Setting primary payout method:', payoutMethodId);

    // Verify the payout method belongs to the user
    const { data: payoutMethod, error: methodError } = await supabase
      .from('payout_methods')
      .select('id')
      .eq('id', payoutMethodId)
      .eq('user_id', user.id)
      .single();

    if (methodError || !payoutMethod) {
      return new Response(
        JSON.stringify({ error: 'Payout method not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Unset all other methods as primary
    const { error: unsetError } = await supabase
      .from('payout_methods')
      .update({ is_primary: false })
      .eq('user_id', user.id);

    if (unsetError) throw unsetError;

    // Set the selected method as primary
    const { error: setPrimaryError } = await supabase
      .from('payout_methods')
      .update({ is_primary: true })
      .eq('id', payoutMethodId);

    if (setPrimaryError) throw setPrimaryError;

    console.log('Primary payout method updated successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Set primary method error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
