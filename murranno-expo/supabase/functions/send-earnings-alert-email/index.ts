import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { Resend } from "npm:resend@2.0.0";
import { earningsAlertEmail } from "../_shared/email-templates.ts";

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { earningId } = await req.json();

    if (!earningId) {
      return new Response(
        JSON.stringify({ error: 'Earning ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending earnings alert email for earning:', earningId);

    // Get earning details
    const { data: earning, error: earningError } = await supabase
      .from('earnings')
      .select('amount, currency, period_start, period_end, platform, artist_id')
      .eq('id', earningId)
      .single();

    if (earningError || !earning) {
      console.error('Earning not found:', earningError);
      return new Response(
        JSON.stringify({ error: 'Earning not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get artist and user details
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('stage_name, user_id')
      .eq('id', earning.artist_id)
      .single();

    if (artistError || !artist) {
      console.error('Artist not found:', artistError);
      return new Response(
        JSON.stringify({ error: 'Artist not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', artist.user_id)
      .single();

    if (profileError || !profile) {
      console.error('User profile not found:', profileError);
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has email notifications enabled
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('email_notifications, earnings_alerts')
      .eq('user_id', artist.user_id)
      .single();

    if (!preferences || (preferences.email_notifications && preferences.earnings_alerts)) {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

      try {
        const periodStart = new Date(earning.period_start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const periodEnd = new Date(earning.period_end).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const period = periodStart === periodEnd ? periodStart : `${periodStart} - ${periodEnd}`;

        await resend.emails.send({
          from: 'Murranno Music <hello@murrannomusic.site>',
          to: [profile.email],
          subject: `New Earnings: ${earning.currency} ${earning.amount.toFixed(2)}`,
          html: earningsAlertEmail(
            artist.stage_name,
            earning.amount,
            earning.currency,
            period,
            earning.platform
          ),
        });

        console.log('Earnings alert email sent successfully to:', profile.email);

        return new Response(
          JSON.stringify({ success: true, message: 'Earnings alert email sent' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (emailError) {
        console.error('Failed to send earnings alert email:', emailError);
        return new Response(
          JSON.stringify({ error: 'Failed to send email', details: emailError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User has earnings email notifications disabled' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Send earnings alert email error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
