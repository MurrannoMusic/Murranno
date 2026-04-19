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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log('Fetching promotion bundles with services');

    // Fetch bundles
    const { data: bundles, error: bundlesError } = await supabase
      .from('promotion_bundles')
      .select('*')
      .eq('is_active', true)
      .order('tier_level');

    if (bundlesError) throw bundlesError;

    // Fetch bundle services with service details
    const bundleIds = bundles?.map(b => b.id) || [];
    const { data: bundleServices, error: servicesError } = await supabase
      .from('bundle_services')
      .select(`
        bundle_id,
        promotion_services (*)
      `)
      .in('bundle_id', bundleIds);

    if (servicesError) throw servicesError;

    // Map services to bundles
    const bundlesWithServices = bundles?.map(bundle => ({
      ...bundle,
      included_services: bundleServices
        ?.filter((bs: any) => bs.bundle_id === bundle.id)
        .map((bs: any) => bs.promotion_services) || []
    }));

    console.log(`Fetched ${bundlesWithServices?.length || 0} bundles`);

    return new Response(
      JSON.stringify({ success: true, bundles: bundlesWithServices }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get bundles error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
