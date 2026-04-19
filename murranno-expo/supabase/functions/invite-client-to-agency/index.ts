import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { Resend } from "npm:resend@2.0.0";
import { agencyInvitationEmail } from "../_shared/email-templates.ts";

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

    // Verify user is an agency
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('tier')
      .eq('user_id', user.id)
      .single();

    if (userRole?.tier !== 'agency') {
      return new Response(
        JSON.stringify({ error: 'Only agencies can invite clients' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { clientEmail, commissionPercentage, contractDetails } = await req.json();

    if (!clientEmail) {
      return new Response(
        JSON.stringify({ error: 'Client email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Inviting client to agency:', { agencyId: user.id, clientEmail });

    // Find client by email
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', clientEmail)
      .single();

    if (!clientProfile) {
      return new Response(
        JSON.stringify({ error: 'User with this email not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if client has artist role
    const { data: clientRole } = await supabase
      .from('user_roles')
      .select('tier')
      .eq('user_id', clientProfile.id)
      .single();

    if (!clientRole || clientRole.tier !== 'artist') {
      return new Response(
        JSON.stringify({ error: 'User is not an artist' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add client to agency
    const { data: agencyClient, error: insertError } = await supabase
      .from('agency_clients')
      .insert({
        agency_id: user.id,
        client_id: clientProfile.id,
        commission_percentage: commissionPercentage || 15,
        contract_details: contractDetails || null,
        status: 'active'
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'Client is already signed to this agency' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw insertError;
    }

    // Create notification for the client
    await supabase.from('notifications').insert({
      user_id: clientProfile.id,
      title: 'Added to Agency',
      message: 'You have been added as a client to an agency',
      type: 'info',
      related_type: 'agency',
      related_id: user.id
    });

    // Get agency name and artist name for email
    const { data: agencyProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const { data: artist } = await supabase
      .from('artists')
      .select('stage_name')
      .eq('user_id', clientProfile.id)
      .single();

    // Send email notification
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Check if client has email notifications enabled
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('email_notifications')
      .eq('user_id', clientProfile.id)
      .single();

    if (!preferences || preferences.email_notifications) {
      try {
        const agencyName = agencyProfile?.full_name || 'Your Agency';
        const artistName = artist?.stage_name || 'Artist';

        await resend.emails.send({
          from: 'Murranno Music <hello@murrannomusic.site>',
          to: [clientEmail],
          subject: `You've been added to ${agencyName}!`,
          html: agencyInvitationEmail(
            artistName,
            agencyName,
            commissionPercentage || 15
          ),
        });
        console.log('Invitation email sent to:', clientEmail);
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Don't fail the whole request if email fails
      }
    }

    console.log('Client invited successfully:', agencyClient.id);

    return new Response(
      JSON.stringify({ success: true, agencyClient }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Invite client to agency error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
