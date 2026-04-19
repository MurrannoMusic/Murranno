import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { Resend } from "npm:resend@2.0.0";
import { labelInvitationEmail } from "../_shared/email-templates.ts";

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

    // Verify user is a label
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('tier')
      .eq('user_id', user.id)
      .single();

    if (userRole?.tier !== 'label') {
      return new Response(
        JSON.stringify({ error: 'Only labels can invite artists' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { artistEmail, revenueSharePercentage, contractStartDate, contractEndDate } = await req.json();

    if (!artistEmail) {
      return new Response(
        JSON.stringify({ error: 'Artist email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Inviting artist to label:', { labelId: user.id, artistEmail });

    // Find artist by email
    const { data: artistProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', artistEmail)
      .single();

    if (!artistProfile) {
      return new Response(
        JSON.stringify({ error: 'Artist with this email not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if artist has artist role
    const { data: artistRole } = await supabase
      .from('user_roles')
      .select('tier')
      .eq('user_id', artistProfile.id)
      .single();

    if (!artistRole || artistRole.tier !== 'artist') {
      return new Response(
        JSON.stringify({ error: 'User is not an artist' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get artist details
    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', artistProfile.id)
      .single();

    if (!artist) {
      return new Response(
        JSON.stringify({ error: 'Artist profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add artist to label
    const { data: labelArtist, error: insertError } = await supabase
      .from('label_artists')
      .insert({
        label_id: user.id,
        artist_id: artist.id,
        revenue_share_percentage: revenueSharePercentage || 50,
        contract_start_date: contractStartDate || null,
        contract_end_date: contractEndDate || null,
        status: 'active'
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'Artist is already signed to this label' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw insertError;
    }

    // Create notification for the artist
    await supabase.from('notifications').insert({
      user_id: artistProfile.id,
      title: 'Added to Label',
      message: 'You have been added to a record label',
      type: 'info',
      related_type: 'label',
      related_id: user.id
    });

    // Get label name and artist details for email
    const { data: labelProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const { data: fullArtist } = await supabase
      .from('artists')
      .select('stage_name')
      .eq('id', artist.id)
      .single();

    // Send email notification
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Check if artist has email notifications enabled
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('email_notifications')
      .eq('user_id', artistProfile.id)
      .single();

    if (!preferences || preferences.email_notifications) {
      try {
        const labelName = labelProfile?.full_name || 'Your Label';
        const artistName = fullArtist?.stage_name || 'Artist';

        await resend.emails.send({
          from: 'Murranno Music <hello@murrannomusic.site>',
          to: [artistEmail],
          subject: `You've been added to ${labelName}!`,
          html: labelInvitationEmail(
            artistName,
            labelName,
            revenueSharePercentage || 50,
            contractStartDate,
            contractEndDate
          ),
        });
        console.log('Invitation email sent to:', artistEmail);
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Don't fail the whole request if email fails
      }
    }

    console.log('Artist invited successfully:', labelArtist.id);

    return new Response(
      JSON.stringify({ success: true, labelArtist }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Invite artist to label error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
