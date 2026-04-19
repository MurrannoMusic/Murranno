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
    const { user_id, action, withdrawal } = await req.json();

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
      case 'approve':
        subject = 'Your Withdrawal Request Has Been Approved';
        message = `Your withdrawal request for ${withdrawal.currency} ${withdrawal.net_amount.toLocaleString()} has been approved and is being processed. The funds should arrive in your account within 24-48 hours.`;
        break;
      case 'reject':
        subject = 'Your Withdrawal Request Has Been Rejected';
        message = `Your withdrawal request for ${withdrawal.currency} ${withdrawal.net_amount.toLocaleString()} has been rejected. ${withdrawal.failure_reason || 'Please contact support for more information.'}`;
        break;
      case 'flag':
        subject = 'Your Withdrawal Request Needs Review';
        message = `Your withdrawal request for ${withdrawal.currency} ${withdrawal.net_amount.toLocaleString()} has been flagged for additional review. We'll update you shortly.`;
        break;
    }

    const emailResponse = await resend.emails.send({
      from: "Murranno Music <hello@murrannomusic.site>",
      to: [profile.email],
      subject,
      html: `
        <h1>Withdrawal Update</h1>
        <p>Hello ${profile.full_name || 'there'},</p>
        <p>${message}</p>
        ${withdrawal.admin_notes ? `<p><strong>Admin Note:</strong> ${withdrawal.admin_notes}</p>` : ''}
        <p>Reference: ${withdrawal.reference}</p>
        <p>If you have any questions, please contact support.</p>
        <p>Best regards,<br>The Murranno Music Team</p>
      `,
    });

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error sending withdrawal email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});