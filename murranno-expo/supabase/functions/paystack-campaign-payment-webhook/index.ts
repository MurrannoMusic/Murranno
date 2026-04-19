import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    // Verify Paystack signature
    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    const hash = await crypto.subtle.digest(
      'SHA-512',
      new TextEncoder().encode(paystackSecretKey + body)
    );
    const expectedSignature = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSignature) {
      console.error('Invalid signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const event = JSON.parse(body);
    console.log('Webhook event received:', event.event);

    // Use service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (event.event === 'charge.success') {
      const { metadata, reference, amount, status } = event.data;

      if (metadata.payment_type === 'campaign' && metadata.campaign_id) {
        console.log('Processing campaign payment:', metadata.campaign_id);

        // Update campaign
        const { error: updateError } = await supabaseClient
          .from('campaigns')
          .update({
            status: 'Paid',
            payment_status: 'paid',
            payment_reference: reference,
          })
          .eq('id', metadata.campaign_id);

        if (updateError) {
          console.error('Error updating campaign:', updateError);
          throw updateError;
        }

        console.log('Campaign payment successful:', metadata.campaign_id);
      }
    } else if (event.event === 'charge.failed') {
      const { metadata, reference } = event.data;

      if (metadata.payment_type === 'campaign' && metadata.campaign_id) {
        console.log('Campaign payment failed:', metadata.campaign_id);

        // Update campaign
        const { error: updateError } = await supabaseClient
          .from('campaigns')
          .update({
            payment_status: 'failed',
          })
          .eq('id', metadata.campaign_id);

        if (updateError) {
          console.error('Error updating campaign:', updateError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in paystack-campaign-payment-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
