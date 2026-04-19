import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
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

    // Verify user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: isAdmin } = await supabase.rpc('has_admin_role', { _user_id: user.id });
    if (!isAdmin) {
      console.error('User is not admin:', user.id);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { settings } = body;

    if (!settings) {
      return new Response(
        JSON.stringify({ success: false, error: 'Settings data required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update platform settings (singleton row)
    const { data, error } = await supabase
      .from('platform_settings')
      .update({
        platform_name: settings.platformName,
        support_email: settings.supportEmail,
        auto_approve_uploads: settings.autoApproveUploads,
        content_moderation_enabled: settings.contentModerationEnabled,
        restricted_words: settings.restrictedWords || [],
        max_uploads_per_month: settings.maxUploadsPerMonth,
        max_file_size_mb: settings.maxFileSize,
        payment_processor: settings.paymentProcessor,
        minimum_payout_amount: settings.minimumPayout,
        payout_schedule: settings.payoutSchedule,
        platform_fee_percentage: settings.platformFee,
        email_notifications_enabled: settings.emailNotifications,
        sms_notifications_enabled: settings.smsNotifications,
      })
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .select()
      .single();

    if (error) {
      console.error('Error updating platform settings:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log to audit trail
    await supabase.from('admin_audit_logs').insert({
      admin_id: user.id,
      action: 'update_platform_settings',
      target_type: 'platform_settings',
      target_id: data.id,
      metadata: { updated_fields: Object.keys(settings) },
    });

    console.log('Platform settings updated successfully');
    return new Response(
      JSON.stringify({ success: true, settings: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});