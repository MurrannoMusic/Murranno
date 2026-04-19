import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, action, subscription } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', user_id)
      .single();

    if (profileError) throw profileError;

    let subject = '';
    let message = '';

    switch (action) {
      case 'grant':
        subject = `Your ${subscription.tier} Access Has Been Granted!`;
        message = `Your ${subscription.tier} tier access has been activated by an admin. You can now enjoy all the features of this plan.`;
        break;
      case 'extend':
        subject = `Your ${subscription.tier} Access Has Been Extended`;
        message = `Good news! Your ${subscription.tier} subscription has been extended until ${new Date(subscription.current_period_end).toLocaleDateString()}.`;
        break;
      case 'cancel':
        subject = `Your ${subscription.tier} Subscription Has Been Cancelled`;
        message = `Your ${subscription.tier} subscription has been cancelled. You'll continue to have access until ${new Date(subscription.current_period_end).toLocaleDateString()}.`;
        break;
      case 'refund':
        subject = `Your ${subscription.tier} Subscription Has Been Refunded`;
        message = `Your ${subscription.tier} subscription has been refunded and cancelled. Any charges will be returned to your payment method.`;
        break;
    }

    const emailResponse = await resend.emails.send({
      from: "Murranno Music <hello@murrannomusic.site>",
      to: [profile.email],
      subject,
      html: `
        <h1>Subscription Update</h1>
        <p>Hello ${profile.full_name || 'there'},</p>
        <p>${message}</p>
        ${subscription.admin_notes ? `<p><strong>Admin Note:</strong> ${subscription.admin_notes}</p>` : ''}
        <p>If you have any questions, please contact support.</p>
        <p>Best regards,<br>The Murranno Music Team</p>
      `,
    });

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error sending subscription email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});