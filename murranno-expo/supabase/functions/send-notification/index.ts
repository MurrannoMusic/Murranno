import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  targetAudience: 'all' | 'artists' | 'labels' | 'agencies';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify admin role
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: isAdmin } = await supabaseClient.rpc('has_admin_role', { _user_id: user.id });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { title, message, type, targetAudience }: NotificationRequest = await req.json();

    console.log('Sending notification:', { title, type, targetAudience });

    // Get target users
    let query = supabaseClient
      .from('user_roles')
      .select('user_id, tier');

    if (targetAudience !== 'all') {
      query = query.eq('tier', targetAudience === 'artists' ? 'artist' : targetAudience === 'labels' ? 'label' : 'agency');
    }

    const { data: userRoles, error: rolesError } = await query;

    if (rolesError) {
      console.error('Error fetching users:', rolesError);
      throw rolesError;
    }

    console.log(`Found ${userRoles?.length || 0} users to notify`);

    // Create in-app notifications
    const notifications = userRoles.map(role => ({
      user_id: role.user_id,
      title,
      message,
      type,
      is_read: false,
    }));

    const { error: notifError } = await supabaseClient
      .from('notifications')
      .insert(notifications);

    if (notifError) {
      console.error('Error creating notifications:', notifError);
      throw notifError;
    }

    console.log('In-app notifications created successfully');

    // Send email notifications
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Get users who have email notifications enabled
    const { data: emailUsers, error: emailError } = await supabaseClient
      .from('notification_preferences')
      .select('user_id')
      .eq('email_notifications', true)
      .in('user_id', userRoles.map(r => r.user_id));

    if (emailError) {
      console.error('Error fetching email preferences:', emailError);
    }

    const emailUserIds = new Set(emailUsers?.map(u => u.user_id) || []);
    console.log(`${emailUserIds.size} users have email notifications enabled`);

    // Get email addresses for users with email notifications enabled
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, email')
      .in('id', Array.from(emailUserIds));

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Send emails
    let emailsSent = 0;
    if (profiles && profiles.length > 0) {
      console.log(`Sending ${profiles.length} emails`);

      for (const profile of profiles) {
        try {
          await resend.emails.send({
            from: 'Murranno Music <hello@murrannomusic.site>',
            to: [profile.email],
            subject: title,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">${title}</h1>
                <p style="color: #666; line-height: 1.6;">${message}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #999; font-size: 12px;">
                  You received this notification from Murranno Music. 
                  You can manage your notification preferences in your account settings.
                </p>
              </div>
            `,
          });
          emailsSent++;
          console.log(`Email sent to ${profile.email}`);
        } catch (emailSendError) {
          console.error(`Failed to send email to ${profile.email}:`, emailSendError);
        }
      }
    }

    // Send push notifications
    let pushNotificationsSent = 0;

    // Get users who have push notifications enabled
    const { data: pushUsers, error: pushError } = await supabaseClient
      .from('notification_preferences')
      .select('user_id')
      .eq('push_notifications', true)
      .in('user_id', userRoles.map(r => r.user_id));

    if (pushError) {
      console.error('Error fetching push preferences:', pushError);
    }

    const pushUserIds = new Set(pushUsers?.map(u => u.user_id) || []);
    console.log(`${pushUserIds.size} users have push notifications enabled`);

    if (pushUserIds.size > 0) {
      // Get active push tokens for users with push notifications enabled
      const { data: pushTokens, error: tokensError } = await supabaseClient
        .from('push_notification_tokens')
        .select('token, platform')
        .eq('is_active', true)
        .in('user_id', Array.from(pushUserIds));

      if (tokensError) {
        console.error('Error fetching push tokens:', tokensError);
      }

      if (pushTokens && pushTokens.length > 0) {
        console.log(`Sending push notifications to ${pushTokens.length} devices`);

        // Note: This is a placeholder for actual push notification sending
        // In production, you would use Firebase Cloud Messaging (FCM) for Android
        // and Apple Push Notification service (APNs) for iOS
        // For now, we just log that push notifications would be sent
        console.log('Push notification payload:', {
          title,
          body: message,
          data: {
            type,
            notificationId: Date.now().toString(),
          },
        });

        pushNotificationsSent = pushTokens.length;

        // TODO: Implement actual push notification sending
        // Example with FCM:
        // for (const token of pushTokens) {
        //   if (token.platform === 'android') {
        //     await sendFCMNotification(token.token, { title, message, type });
        //   } else if (token.platform === 'ios') {
        //     await sendAPNsNotification(token.token, { title, message, type });
        //   }
        // }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notificationsSent: notifications.length,
        emailsSent,
        pushNotificationsSent,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
