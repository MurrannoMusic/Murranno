import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Verify admin role
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
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

    const { action, withdrawal_id, admin_notes, failure_reason } = await req.json();

    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get withdrawal details
    const { data: withdrawal, error: fetchError } = await serviceSupabase
      .from('withdrawal_transactions')
      .select('*, payout_methods(*)')
      .eq('id', withdrawal_id)
      .single();

    if (fetchError) throw fetchError;

    let result;
    const now = new Date();

    switch (action) {
      case 'approve': {
        // Call Paystack transfer API
        const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY');
        const transferData = {
          source: 'balance',
          amount: withdrawal.amount * 100, // Convert to kobo
          recipient: withdrawal.payout_methods.recipient_code,
          reason: withdrawal.description || 'Withdrawal request',
          reference: withdrawal.reference,
        };

        const paystackResponse = await fetch('https://api.paystack.co/transfer', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paystackSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transferData),
        });

        const transferResult = await paystackResponse.json();
        
        if (!transferResult.status) {
          throw new Error(transferResult.message || 'Transfer failed');
        }

        // Update withdrawal status
        const { data: approved, error: approveError } = await serviceSupabase
          .from('withdrawal_transactions')
          .update({
            status: 'processing',
            transfer_code: transferResult.data.transfer_code,
            admin_notes,
            reviewed_by: user.id,
            reviewed_at: now.toISOString(),
            paystack_response: transferResult,
          })
          .eq('id', withdrawal_id)
          .select()
          .single();

        if (approveError) throw approveError;
        result = approved;
        break;
      }

      case 'reject': {
        // Reject and refund to wallet
        const { data: rejected, error: rejectError } = await serviceSupabase
          .from('withdrawal_transactions')
          .update({
            status: 'rejected',
            failure_reason,
            admin_notes,
            reviewed_by: user.id,
            reviewed_at: now.toISOString(),
          })
          .eq('id', withdrawal_id)
          .select()
          .single();

        if (rejectError) throw rejectError;

        // Refund to wallet balance
        const { error: walletError } = await serviceSupabase.rpc('refund_withdrawal_to_wallet', {
          p_user_id: withdrawal.user_id,
          p_amount: withdrawal.net_amount,
        });

        if (walletError) {
          console.error('Wallet refund error:', walletError);
          // Try manual update
          await serviceSupabase
            .from('wallet_balance')
            .update({
              available_balance: serviceSupabase.rpc('increment_balance', { amount: withdrawal.net_amount }),
              pending_balance: serviceSupabase.rpc('decrement_balance', { amount: withdrawal.net_amount }),
            })
            .eq('user_id', withdrawal.user_id);
        }

        result = rejected;
        break;
      }

      case 'flag': {
        // Flag for review
        const { data: flagged, error: flagError } = await serviceSupabase
          .from('withdrawal_transactions')
          .update({
            status: 'flagged',
            admin_notes,
            reviewed_by: user.id,
            reviewed_at: now.toISOString(),
          })
          .eq('id', withdrawal_id)
          .select()
          .single();

        if (flagError) throw flagError;
        result = flagged;
        break;
      }

      case 'add_note': {
        // Just add notes
        const { data: noted, error: noteError } = await serviceSupabase
          .from('withdrawal_transactions')
          .update({
            admin_notes,
          })
          .eq('id', withdrawal_id)
          .select()
          .single();

        if (noteError) throw noteError;
        result = noted;
        break;
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Log to audit logs
    await serviceSupabase.from('admin_audit_logs').insert({
      admin_id: user.id,
      action: `withdrawal_${action}`,
      target_type: 'withdrawal',
      target_id: withdrawal_id,
      metadata: { action, admin_notes, failure_reason, result },
    });

    // Send notification email
    try {
      await supabaseClient.functions.invoke('send-withdrawal-status-email', {
        body: { 
          user_id: withdrawal.user_id, 
          action, 
          withdrawal: result 
        },
      });
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in admin-review-withdrawal:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});