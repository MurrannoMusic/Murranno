import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin role
    const { data: isAdmin, error: roleError } = await supabase.rpc('has_admin_role', { _user_id: user.id });
    
    if (roleError) {
      console.error('Error checking admin role:', roleError);
      return new Response(JSON.stringify({ success: false, error: 'Failed to verify admin access', details: roleError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!isAdmin) {
      console.log('User is not admin:', user.id);
      return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Admin access granted for user:', user.id);

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get users by tier
    const { data: usersByTier } = await supabase
      .from('user_roles')
      .select('tier');

    // Get active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'trial']);

    // Get total releases
    const { count: totalReleases } = await supabase
      .from('releases')
      .select('*', { count: 'exact', head: true });

    // Get total campaigns
    const { count: totalCampaigns } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true });

    // Get total earnings
    const { data: earningsData } = await supabase
      .from('earnings')
      .select('amount')
      .eq('status', 'paid');

    const totalEarnings = earningsData?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;

    // Get total withdrawals
    const { data: withdrawalsData } = await supabase
      .from('withdrawal_transactions')
      .select('amount')
      .eq('status', 'completed');

    const totalWithdrawals = withdrawalsData?.reduce((sum, w) => sum + parseFloat(w.amount), 0) || 0;

    // Calculate tier distribution
    const tierDistribution = usersByTier?.reduce((acc: any, { tier }) => {
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {}) || {};

    // Log admin action
    await supabase.from('admin_audit_logs').insert({
      admin_id: user.id,
      action: 'VIEW_PLATFORM_ANALYTICS',
      target_type: 'analytics',
    });

    return new Response(JSON.stringify({
      success: true,
      analytics: {
        totalUsers,
        activeSubscriptions,
        totalReleases,
        totalCampaigns,
        totalEarnings,
        totalWithdrawals,
        platformRevenue: totalEarnings - totalWithdrawals,
        tierDistribution,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching platform analytics:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});