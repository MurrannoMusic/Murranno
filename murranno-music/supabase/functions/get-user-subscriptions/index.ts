import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all subscriptions for the user (label and agency)
    const { data: subscriptions, error: subsError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id);

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      throw subsError;
    }

    // Get all subscription plans
    const { data: plans, error: plansError } = await supabaseClient
      .from('subscription_plans')
      .select('*');

    if (plansError) {
      console.error('Error fetching plans:', plansError);
      throw plansError;
    }

    // Manually join subscriptions with their plans based on tier
    const subscriptionsWithPlans = (subscriptions || []).map(sub => {
      const plan = plans?.find(p => p.tier === sub.tier);
      return {
        ...sub,
        subscription_plans: plan ? {
          name: plan.name,
          price_monthly: plan.price_monthly,
          currency: plan.currency,
          max_artists: plan.max_artists,
          features: plan.features
        } : null
      };
    });

    const now = new Date();

    // Process each subscription to determine access
    const processedSubscriptions = subscriptionsWithPlans.map(sub => {
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

    // Determine accessible tiers
    // Artist is always available for authenticated users
    const accessibleTiers = ['artist'];
    
    processedSubscriptions.forEach(sub => {
      if (sub.isActive) {
        accessibleTiers.push(sub.tier);
      }
    });

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
    console.error('Error in get-user-subscriptions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
