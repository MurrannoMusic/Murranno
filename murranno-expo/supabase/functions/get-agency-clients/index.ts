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
    const status = url.searchParams.get('status');

    console.log('Fetching agency clients for:', user.id);

    // Get agency clients
    let query = supabase
      .from('agency_clients')
      .select(`
        *,
        artists:client_id (
          id,
          stage_name,
          profile_image,
          user_id
        )
      `)
      .eq('agency_id', user.id);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: agencyClients, error: clientsError } = await query;

    if (clientsError) throw clientsError;

    // For each client, get their stats
    const clientsWithStats = await Promise.all(
      (agencyClients || []).map(async (client) => {
        const artistId = client.artists?.id;

        // Get release count
        const { count: releaseCount } = await supabase
          .from('releases')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', artistId);

        // Get total streams
        const { data: streamData } = await supabase
          .from('streaming_data')
          .select('streams')
          .in('track_id', 
            supabase
              .from('tracks')
              .select('id')
              .in('release_id',
                supabase
                  .from('releases')
                  .select('id')
                  .eq('artist_id', artistId)
              )
          );

        const totalStreams = streamData?.reduce((sum, s) => sum + (s.streams || 0), 0) || 0;

        // Get total campaigns
        const { count: campaignCount } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', artistId);

        // Get total earnings
        const { data: earningsData } = await supabase
          .from('earnings')
          .select('amount')
          .eq('artist_id', artistId)
          .eq('status', 'paid');

        const totalEarnings = earningsData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

        return {
          id: client.id,
          client_id: client.client_id,
          stage_name: client.artists?.stage_name || 'Unknown Artist',
          profile_image: client.artists?.profile_image,
          status: client.status,
          commission_percentage: client.commission_percentage,
          contract_details: client.contract_details,
          notes: client.notes,
          created_at: client.created_at,
          releases: releaseCount || 0,
          streams: totalStreams.toString(),
          campaigns: campaignCount || 0,
          revenue: totalEarnings.toFixed(2)
        };
      })
    );

    console.log('Found clients:', clientsWithStats.length);

    return new Response(
      JSON.stringify({ success: true, clients: clientsWithStats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get agency clients error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
