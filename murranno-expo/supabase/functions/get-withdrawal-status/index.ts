import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

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

    const url = new URL(req.url);
    const transactionId = url.searchParams.get('id');

    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: 'Transaction ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching withdrawal status for:', transactionId);

    // Get withdrawal transaction
    const { data: transaction, error: txError } = await supabase
      .from('withdrawal_transactions')
      .select(`
        *,
        payout_methods (
          type,
          account_name,
          account_number,
          bank_name
        )
      `)
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single();

    if (txError || !transaction) {
      console.error('Transaction not found:', txError);
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If we have a Paystack transfer code, check status with Paystack
    if (transaction.transfer_code) {
      const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
      
      if (paystackSecretKey) {
        try {
          const response = await fetch(
            `https://api.paystack.co/transfer/${transaction.transfer_code}`,
            {
              headers: {
                'Authorization': `Bearer ${paystackSecretKey}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            const paystackData = await response.json();
            const paystackStatus = paystackData.data.status;

            // Map Paystack status to our status
            let newStatus = transaction.status;
            if (paystackStatus === 'success') {
              newStatus = 'paid';
            } else if (paystackStatus === 'failed') {
              newStatus = 'failed';
            } else if (paystackStatus === 'pending' || paystackStatus === 'otp' || paystackStatus === 'queued') {
              newStatus = 'processing';
            }

            // Update transaction if status changed
            if (newStatus !== transaction.status) {
              const updateData: any = {
                status: newStatus,
                paystack_response: paystackData.data,
              };

              if (newStatus === 'paid') {
                updateData.completed_at = new Date().toISOString();
              } else if (newStatus === 'failed') {
                updateData.failure_reason = paystackData.data.failure_reason || 'Transfer failed';
              }

              await supabase
                .from('withdrawal_transactions')
                .update(updateData)
                .eq('id', transactionId);

              transaction.status = newStatus;
              transaction.paystack_response = paystackData.data;
            }
          }
        } catch (error) {
          console.error('Error checking Paystack status:', error);
        }
      }
    }

    console.log('Withdrawal status fetched successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        transaction 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get withdrawal status error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
