import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegisterTokenRequest {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceInfo?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { token, platform, deviceInfo }: RegisterTokenRequest = await req.json();

    console.log('Registering push token for user:', user.id, 'platform:', platform);

    // Check if token already exists
    const { data: existingToken } = await supabaseClient
      .from('push_notification_tokens')
      .select('id')
      .eq('token', token)
      .eq('user_id', user.id)
      .single();

    if (existingToken) {
      // Update existing token
      const { error: updateError } = await supabaseClient
        .from('push_notification_tokens')
        .update({
          platform,
          device_info: deviceInfo,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingToken.id);

      if (updateError) {
        console.error('Error updating token:', updateError);
        throw updateError;
      }

      console.log('Updated existing push token');
    } else {
      // Insert new token
      const { error: insertError } = await supabaseClient
        .from('push_notification_tokens')
        .insert({
          user_id: user.id,
          token,
          platform,
          device_info: deviceInfo,
          is_active: true,
        });

      if (insertError) {
        console.error('Error inserting token:', insertError);
        throw insertError;
      }

      console.log('Registered new push token');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Token registered successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in register-push-token:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
