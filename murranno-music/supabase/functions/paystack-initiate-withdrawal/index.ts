import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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
    )

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { payout_method_id, amount, description, pin } = await req.json()

    if (!pin) {
      throw new Error('Transaction PIN is required')
    }

    // Capture device metadata
    const ipAddress = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Verify PIN and Check Lock
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('transaction_pin_hash, payout_lock_until')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('User profile not found')
    }

    if (!profile.transaction_pin_hash) {
      throw new Error('Transaction PIN not set')
    }

    const isPinValid = await bcrypt.compare(pin, profile.transaction_pin_hash)
    if (!isPinValid) {
      throw new Error('Incorrect transaction PIN')
    }

    if (profile.payout_lock_until) {
      const lockUntil = new Date(profile.payout_lock_until)
      if (lockUntil > new Date()) {
        throw new Error(`Security lock active until ${lockUntil.toLocaleString()}. Payouts are restricted after changing bank details.`)
      }
    }

    console.log('Initiating withdrawal:', { payout_method_id, amount, description, ipAddress })

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount')
    }

    const { data: wallet, error: walletError } = await supabaseClient
      .from('wallet_balance')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (walletError) {
      console.error('Wallet error:', walletError)
      throw walletError
    }

    if (!wallet) {
      throw new Error('Wallet not found. Please contact support.')
    }

    if (wallet.available_balance < amount) {
      throw new Error('Insufficient balance')
    }

    const { data: payoutMethod, error: methodError } = await supabaseClient
      .from('payout_methods')
      .select('*')
      .eq('id', payout_method_id)
      .eq('user_id', user.id)
      .single()

    if (methodError || !payoutMethod) {
      console.error('Payout method error:', methodError)
      throw new Error('Payout method not found')
    }

    const fee = amount >= 5000 ? 50 : 25
    const netAmount = amount - fee
    const reference = `WD-${Date.now()}-${user.id.substring(0, 8)}`

    // Progressive Threshold Logic
    const TIER_2_THRESHOLD = 5000;
    const TIER_3_THRESHOLD = 50000;

    let status = 'processing';
    let paystackData = null;
    let scheduledFor = null;
    let isAnomalous = false;

    // Anomaly Detection: Compare with last successful withdrawal
    const { data: lastWithdrawal } = await supabaseClient
      .from('withdrawal_transactions')
      .select('ip_address, user_agent')
      .eq('user_id', user.id)
      .eq('status', 'processing')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastWithdrawal && (lastWithdrawal.ip_address !== ipAddress || lastWithdrawal.user_agent !== userAgent)) {
      console.log('Anomalous activity detected: IP or User-Agent mismatch');
      isAnomalous = true;
    }

    if (amount >= TIER_3_THRESHOLD || isAnomalous) {
      status = 'pending_review';
    } else if (amount >= TIER_2_THRESHOLD) {
      status = 'pending_delay';
      const delayDate = new Date();
      delayDate.setHours(delayDate.getHours() + 12);
      scheduledFor = delayDate.toISOString();
    } else {
      // Tier 1: Instant Payout
      const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')
      if (!paystackSecretKey) {
        throw new Error('Paystack secret key not configured')
      }

      const response = await fetch('https://api.paystack.co/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'balance',
          reason: description || 'Withdrawal from wallet',
          amount: Math.round(netAmount * 100),
          recipient: payoutMethod.recipient_code,
          reference: reference,
        }),
      })

      const pd = await response.json()
      console.log('Paystack transfer response:', pd)

      if (!pd.status) {
        throw new Error(pd.message || 'Failed to initiate transfer')
      }
      status = 'processing';
      paystackData = pd.data;
    }

    // Insert Transaction with Metadata
    const { data: transaction, error: txError } = await supabaseClient
      .from('withdrawal_transactions')
      .insert({
        user_id: user.id,
        payout_method_id: payout_method_id,
        amount: amount,
        fee: fee,
        net_amount: netAmount,
        currency: 'NGN',
        status: status,
        transfer_code: paystackData?.transfer_code || null,
        reference: reference,
        description: description || 'Withdrawal from wallet',
        paystack_response: paystackData,
        scheduled_for: scheduledFor,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single()

    if (txError) {
      console.error('Transaction error:', txError)
      throw txError
    }

    // Log Security Activity
    await supabaseClient.from('security_logs').insert({
      user_id: user.id,
      event: 'withdrawal_requested',
      details: { amount, status, ip: ipAddress, tier: amount >= TIER_3_THRESHOLD ? 3 : (amount >= TIER_2_THRESHOLD ? 2 : 1) },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    if (txError) {
      console.error('Transaction error:', txError)
      throw txError
    }

    const { error: balanceError } = await supabaseClient
      .from('wallet_balance')
      .update({
        available_balance: wallet.available_balance - amount,
        pending_balance: wallet.pending_balance + amount,
      })
      .eq('user_id', user.id)

    if (balanceError) {
      console.error('Balance update error:', balanceError)
    }

    await supabaseClient
      .from('payout_methods')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', payout_method_id)

    console.log('Withdrawal initiated successfully:', transaction)

    return new Response(
      JSON.stringify({
        success: true,
        data: transaction,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error initiating withdrawal:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
