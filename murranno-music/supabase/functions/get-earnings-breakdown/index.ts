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
    const period = url.searchParams.get('period') || '30days';

    console.log('Fetching earnings breakdown for user:', user.id, 'period:', period);

    // Calculate date range based on period
    let startDate = new Date();
    switch (period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get user's artist ID
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (artistError && artistError.code !== 'PGRST116') {
      throw artistError;
    }

    let earningsData = [];

    if (artist) {
      // Get earnings breakdown by source
      const { data: earnings, error: earningsError } = await supabase
        .from('earnings')
        .select('*')
        .eq('artist_id', artist.id)
        .gte('period_start', startDate.toISOString())
        .eq('status', 'paid');

      if (earningsError) throw earningsError;

      // Group earnings by source/platform
      const sourceMap = new Map();
      
      earnings.forEach(earning => {
        const key = `${earning.source}-${earning.platform || 'other'}`;
        if (!sourceMap.has(key)) {
          sourceMap.set(key, {
            source: earning.source,
            platform: earning.platform || 'other',
            amount: 0,
            count: 0
          });
        }
        const current = sourceMap.get(key);
        current.amount += Number(earning.amount);
        current.count += 1;
      });

      earningsData = Array.from(sourceMap.values());
    }

    console.log('Earnings breakdown fetched successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        earnings: earningsData,
        period 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get earnings breakdown error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
