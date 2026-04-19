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

    const url = new URL(req.url);
    const category = url.searchParams.get('category');

    console.log('Fetching promotion services, category:', category);

    let query = supabase
      .from('promotion_services')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: services, error } = await query;

    if (error) throw error;

    console.log(`Fetched ${services?.length || 0} services`);

    return new Response(
      JSON.stringify({ success: true, services }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get services error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
