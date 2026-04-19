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

    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ success: false, error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ success: false, error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update user role to admin
    const { error: roleError } = await supabase
      .from('user_roles')
      .update({ tier: 'admin' })
      .eq('user_id', profile.id);

    if (roleError) throw roleError;

    // Update subscription to admin tier with active status
    const { error: subError } = await supabase
      .from('subscriptions')
      .update({ 
        tier: 'admin',
        status: 'active',
        current_period_end: null,
        trial_ends_at: null
      })
      .eq('user_id', profile.id);

    if (subError) throw subError;

    // Log the promotion
    await supabase.from('admin_audit_logs').insert({
      admin_id: profile.id,
      action: 'PROMOTE_TO_ADMIN',
      target_type: 'user',
      target_id: profile.id,
      metadata: { 
        email: email,
        promoted_at: new Date().toISOString(),
        initial_setup: true
      },
    });

    console.log(`User ${email} promoted to admin successfully`);

    return new Response(JSON.stringify({ 
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        tier: 'admin'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error promoting user to admin:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
