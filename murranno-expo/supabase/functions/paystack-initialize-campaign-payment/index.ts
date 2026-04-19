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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { campaign_id } = await req.json();

    if (!campaign_id) {
      return new Response(
        JSON.stringify({ error: 'Campaign ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .select('*, promotion_bundles(name, price), campaign_services(promotion_services(name, price))')
      .eq('id', campaign_id)
      .eq('user_id', user.id)
      .single();

    if (campaignError || !campaign) {
      console.error('Campaign fetch error:', campaignError);
      return new Response(
        JSON.stringify({ error: 'Campaign not found or unauthorized' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate total amount
    let totalAmount = 0;
    if (campaign.bundle_id && campaign.promotion_bundles) {
      totalAmount = Number(campaign.promotion_bundles.price);
    } else if (campaign.campaign_services && campaign.campaign_services.length > 0) {
      totalAmount = campaign.campaign_services.reduce((sum: number, cs: any) => {
        return sum + Number(cs.promotion_services.price);
      }, 0);
    }

    if (totalAmount === 0) {
      return new Response(
        JSON.stringify({ error: 'Campaign has no services or bundle selected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile for email
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: profile?.email || user.email,
        amount: totalAmount * 100, // Convert to kobo
        currency: 'NGN',
        metadata: {
          user_id: user.id,
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          full_name: profile?.full_name || '',
          payment_type: 'campaign',
        },
        callback_url: `${Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '')}/app/campaign-payment-success?reference={reference}`,
      }),
    });

    const paystackData = await paystackResponse.json();
    console.log('Paystack initialization response:', paystackData);

    if (!paystackData.status) {
      return new Response(
        JSON.stringify({ error: paystackData.message || 'Payment initialization failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update campaign status to Pending Payment
    const { error: updateError } = await supabaseClient
      .from('campaigns')
      .update({
        status: 'Pending Payment',
        payment_status: 'pending',
        payment_reference: paystackData.data.reference,
        payment_amount: totalAmount,
      })
      .eq('id', campaign_id);

    if (updateError) {
      console.error('Campaign update error:', updateError);
    }

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in paystack-initialize-campaign-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
