import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { Resend } from "npm:resend@2.0.0";
import { welcomeEmail } from "../_shared/email-templates.ts";

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

    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending welcome email for user:', userId);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found:', profileError);
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user role
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('tier')
      .eq('user_id', userId)
      .single();

    if (roleError || !userRole) {
      console.error('User role not found:', roleError);
      return new Response(
        JSON.stringify({ error: 'User role not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has email notifications enabled (default to true for new users)
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('email_notifications')
      .eq('user_id', userId)
      .single();

    if (!preferences || preferences.email_notifications) {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

      try {
        await resend.emails.send({
          from: 'Murranno Music <hello@murrannomusic.site>',
          to: [profile.email],
          subject: 'Welcome to Murranno Music! 🎵',
          html: welcomeEmail(profile.full_name || 'there', userRole.tier),
        });

        console.log('Welcome email sent successfully to:', profile.email);

        return new Response(
          JSON.stringify({ success: true, message: 'Welcome email sent' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        return new Response(
          JSON.stringify({ error: 'Failed to send email', details: emailError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User has email notifications disabled' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Send welcome email error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
