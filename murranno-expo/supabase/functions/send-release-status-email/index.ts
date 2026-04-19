import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { Resend } from "npm:resend@2.0.0";
import { releaseStatusEmail } from "../_shared/email-templates.ts";

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

    const { releaseId, status, rejectionReason } = await req.json();

    if (!releaseId || !status) {
      return new Response(
        JSON.stringify({ error: 'Release ID and status are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending release status email:', { releaseId, status });

    // Get release details
    const { data: release, error: releaseError } = await supabase
      .from('releases')
      .select('title, release_date, artist_id')
      .eq('id', releaseId)
      .single();

    if (releaseError || !release) {
      console.error('Release not found:', releaseError);
      return new Response(
        JSON.stringify({ error: 'Release not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get artist details
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('stage_name, user_id')
      .eq('id', release.artist_id)
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
      .select('email_notifications, release_updates')
      .eq('user_id', artist.user_id)
      .single();

    if (!preferences || (preferences.email_notifications && preferences.release_updates)) {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

      try {
        await resend.emails.send({
          from: 'Murranno Music <hello@murrannomusic.site>',
          to: [profile.email],
          subject: `Release Update: ${release.title}`,
          html: releaseStatusEmail(
            artist.stage_name,
            release.title,
            status,
            release.release_date
          ),
        });

        console.log('Release status email sent successfully to:', profile.email);

        // Create in-app notification
        await supabase.from('notifications').insert({
          user_id: artist.user_id,
          title: `Release ${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Updated'}`,
          message: status === 'approved'
            ? `Your release "${release.title}" has been approved and will be distributed on ${new Date(release.release_date).toLocaleDateString()}.`
            : status === 'rejected'
              ? `Your release "${release.title}" was rejected. ${rejectionReason || 'Please review and resubmit.'}`
              : `Your release "${release.title}" status has been updated to ${status}.`,
          type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
          related_type: 'release',
          related_id: releaseId
        });

        return new Response(
          JSON.stringify({ success: true, message: 'Release status email sent' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (emailError) {
        console.error('Failed to send release status email:', emailError);
        return new Response(
          JSON.stringify({ error: 'Failed to send email', details: emailError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User has release email notifications disabled' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Send release status email error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
