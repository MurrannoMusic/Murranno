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

    // Verify user is an agency
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('tier')
      .eq('user_id', user.id)
      .single();

    if (userRole?.tier !== 'agency') {
      return new Response(
        JSON.stringify({ error: 'Only agencies can add clients' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { clientId, commissionPercentage, contractDetails, notes } = await req.json();

    if (!clientId) {
      return new Response(
        JSON.stringify({ error: 'Client ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Adding client to agency:', { agencyId: user.id, clientId });

    // Check if client exists and is an artist
    const { data: clientRole } = await supabase
      .from('user_roles')
      .select('tier')
      .eq('user_id', clientId)
      .single();

    if (!clientRole || clientRole.tier !== 'artist') {
      return new Response(
        JSON.stringify({ error: 'Client must be an artist' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add client to agency
    const { data: agencyClient, error: insertError } = await supabase
      .from('agency_clients')
      .insert({
        agency_id: user.id,
        client_id: clientId,
        commission_percentage: commissionPercentage || 15,
        contract_details: contractDetails || {},
        notes: notes || null,
        status: 'active'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Create notification for the client
    await supabase.from('notifications').insert({
      user_id: clientId,
      title: 'Added to Agency',
      message: 'You have been added to an agency roster',
      type: 'info',
      related_type: 'agency',
      related_id: user.id
    });

    console.log('Client added successfully:', agencyClient.id);

    return new Response(
      JSON.stringify({ success: true, agencyClient }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Add client to agency error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
