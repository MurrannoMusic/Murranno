import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { Resend } from "npm:resend@2.0.0";
import { campaignStatusEmail } from "../_shared/email-templates.ts";

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

    const { campaignId, oldStatus, newStatus, rejectionReason } = await req.json();

    if (!campaignId || !newStatus) {
      return new Response(
        JSON.stringify({ error: 'Campaign ID and new status are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending campaign status email:', { campaignId, oldStatus, newStatus });

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('name, user_id')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error('Campaign not found:', campaignError);
      return new Response(
        JSON.stringify({ error: 'Campaign not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', campaign.user_id)
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
      .select('email_notifications, campaign_updates')
      .eq('user_id', campaign.user_id)
      .single();

    if (!preferences || (preferences.email_notifications && preferences.campaign_updates)) {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

      try {
        await resend.emails.send({
          from: 'Murranno Music <hello@murrannomusic.site>',
          to: [profile.email],
          subject: `Campaign Update: ${campaign.name}`,
          html: campaignStatusEmail(
            profile.full_name || 'there',
            campaign.name,
            oldStatus || 'previous',
            newStatus,
            rejectionReason
          ),
        });

        console.log('Campaign status email sent successfully to:', profile.email);

        return new Response(
          JSON.stringify({ success: true, message: 'Campaign status email sent' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (emailError) {
        console.error('Failed to send campaign status email:', emailError);
        return new Response(
          JSON.stringify({ error: 'Failed to send email', details: emailError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User has campaign email notifications disabled' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Send campaign status email error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
