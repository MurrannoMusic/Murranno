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

    // Make authentication optional - allow unauthenticated users to view plans
    const { data: { user } } = await supabase.auth.getUser();

    console.log('Fetching subscription plans');

    // Get all available subscription plans (public information)
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_monthly', { ascending: true });

    if (plansError) throw plansError;

    // Only get user's current subscription if they are logged in
    let currentSubscription = null;
    if (user) {
      const { data } = await supabase
        .from('subscriptions')
        .select('tier, status')
        .eq('user_id', user.id)
        .maybeSingle();
      currentSubscription = data;
    }

    console.log('Subscription plans fetched successfully');

    return new Response(
      JSON.stringify({
        success: true,
        plans,
        currentTier: currentSubscription?.tier || null,
        currentStatus: currentSubscription?.status || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get subscription plans error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
