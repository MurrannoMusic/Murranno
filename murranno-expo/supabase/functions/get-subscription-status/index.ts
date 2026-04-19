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

    console.log('Fetching subscription status for user:', user.id);

    // Get all subscriptions for the user (label and agency add-ons)
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
          price_monthly,
          currency,
          max_artists,
          features
        )
      `)
      .eq('user_id', user.id);

    if (subError) throw subError;

    const now = new Date();

    // Process each subscription
    const processedSubscriptions = (subscriptions || []).map(sub => {
      const trialEnded = sub.trial_ends_at && new Date(sub.trial_ends_at) < now;
      const periodEnded = sub.current_period_end && new Date(sub.current_period_end) < now;
      const isActive = (sub.status === 'active' && !periodEnded) || 
                      (sub.status === 'trial' && !trialEnded);
      const isTrial = sub.status === 'trial' && !trialEnded;

      let daysRemaining = 0;
      if (isTrial && sub.trial_ends_at) {
        const trialEnd = new Date(sub.trial_ends_at);
        const diffTime = trialEnd.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else if (isActive && sub.current_period_end) {
        const periodEnd = new Date(sub.current_period_end);
        const diffTime = periodEnd.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        ...sub,
        isActive,
        isTrial,
        trialEnded,
        periodEnded,
        daysRemaining,
      };
    });

    // Artist is always accessible
    const accessibleTiers = ['artist'];
    processedSubscriptions.forEach(sub => {
      if (sub.isActive) {
        accessibleTiers.push(sub.tier);
      }
    });

    console.log('Subscription status fetched successfully');

    return new Response(
      JSON.stringify({
        success: true,
        subscriptions: processedSubscriptions,
        accessibleTiers,
        hasLabelAccess: accessibleTiers.includes('label'),
        hasAgencyAccess: accessibleTiers.includes('agency'),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get subscription status error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
