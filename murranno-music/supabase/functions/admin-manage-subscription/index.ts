import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    // Verify admin role
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: isAdmin } = await supabaseClient.rpc('has_admin_role', { _user_id: user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, subscription_id, user_id, tier, duration_months, admin_notes, trial_days } = await req.json();

    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let result;
    const now = new Date();

    switch (action) {
      case 'grant': {
        // Create new subscription
        const periodStart = new Date();
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + (duration_months || 1));

        const trialEnd = trial_days ? new Date() : null;
        if (trialEnd) {
          trialEnd.setDate(trialEnd.getDate() + trial_days);
        }

        const { data: newSub, error: createError } = await serviceSupabase
          .from('subscriptions')
          .insert({
            user_id,
            tier,
            status: trial_days ? 'trial' : 'active',
            current_period_start: periodStart.toISOString(),
            current_period_end: periodEnd.toISOString(),
            trial_ends_at: trialEnd?.toISOString(),
            admin_notes,
            manually_managed: true,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Update user_roles if needed
        const { error: roleError } = await serviceSupabase
          .from('user_roles')
          .update({ tier })
          .eq('user_id', user_id);

        if (roleError) console.error('Role update error:', roleError);

        result = newSub;
        break;
      }

      case 'extend': {
        // Extend subscription period
        const { data: existing, error: fetchError } = await serviceSupabase
          .from('subscriptions')
          .select('*')
          .eq('id', subscription_id)
          .single();

        if (fetchError) throw fetchError;

        const currentEnd = new Date(existing.current_period_end || now);
        currentEnd.setMonth(currentEnd.getMonth() + (duration_months || 1));

        const { data: updated, error: updateError } = await serviceSupabase
          .from('subscriptions')
          .update({
            current_period_end: currentEnd.toISOString(),
            admin_notes,
            manually_managed: true,
          })
          .eq('id', subscription_id)
          .select()
          .single();

        if (updateError) throw updateError;
        result = updated;
        break;
      }

      case 'cancel': {
        // Cancel subscription
        const { data: cancelled, error: cancelError } = await serviceSupabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: now.toISOString(),
            admin_notes,
          })
          .eq('id', subscription_id)
          .select()
          .single();

        if (cancelError) throw cancelError;
        result = cancelled;
        break;
      }

      case 'refund': {
        // Mark as refunded
        const { data: refunded, error: refundError } = await serviceSupabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            refunded_at: now.toISOString(),
            cancelled_at: now.toISOString(),
            admin_notes,
          })
          .eq('id', subscription_id)
          .select()
          .single();

        if (refundError) throw refundError;
        result = refunded;
        break;
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Log to audit logs
    await serviceSupabase.from('admin_audit_logs').insert({
      admin_id: user.id,
      action: `subscription_${action}`,
      target_type: 'subscription',
      target_id: subscription_id || result.id,
      metadata: { action, tier, duration_months, admin_notes, result },
    });

    // Send notification email
    try {
      await supabaseClient.functions.invoke('send-subscription-status-email', {
        body: { 
          user_id: user_id || result.user_id, 
          action, 
          subscription: result 
        },
      });
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in admin-manage-subscription:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});