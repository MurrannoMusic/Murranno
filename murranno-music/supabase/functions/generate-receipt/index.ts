import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { transactionId } = await req.json();

    if (!transactionId) {
      return new Response(JSON.stringify({ error: 'Transaction ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch transaction details
    const { data: transaction, error: txError } = await supabase
      .from('withdrawal_transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single();

    if (txError || !transaction) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    // Get payout method details
    const { data: payoutMethod } = await supabase
      .from('payout_methods')
      .select('bank_name, account_number, account_name')
      .eq('id', transaction.payout_method_id)
      .single();

    // Generate HTML receipt
    const receiptDate = new Date(transaction.requested_at || transaction.created_at).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const completedDate = transaction.completed_at 
      ? new Date(transaction.completed_at).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Pending';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt - ${transaction.reference}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #333; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #333; font-size: 32px; }
          .header p { margin: 5px 0; color: #666; }
          .receipt-info { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .receipt-info h2 { margin-top: 0; color: #333; font-size: 20px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
          .info-item { padding: 10px 0; }
          .info-label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
          .info-value { color: #333; font-size: 16px; }
          .amount-section { text-align: center; padding: 30px; background: #e8f5e9; border-radius: 8px; margin: 30px 0; }
          .amount-section .label { color: #666; font-size: 14px; margin-bottom: 10px; }
          .amount-section .amount { font-size: 48px; font-weight: bold; color: #2e7d32; }
          .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; text-transform: uppercase; font-size: 12px; }
          .status.paid { background: #e8f5e9; color: #2e7d32; }
          .status.pending { background: #fff3e0; color: #f57c00; }
          .status.failed { background: #ffebee; color: #c62828; }
          .breakdown { border-top: 2px solid #ddd; padding-top: 20px; margin-top: 30px; }
          .breakdown-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
          .breakdown-row.total { border-top: 2px solid #333; border-bottom: none; font-weight: bold; font-size: 18px; margin-top: 10px; padding-top: 20px; }
          .breakdown-label { color: #666; }
          .breakdown-value { color: #333; font-weight: 600; }
          .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Murranno Music</h1>
          <p>Official Transaction Receipt</p>
        </div>

        <div class="receipt-info">
          <h2>Receipt Details</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Receipt Number</div>
              <div class="info-value">${transaction.reference}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Transaction ID</div>
              <div class="info-value">${transaction.id}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date Issued</div>
              <div class="info-value">${receiptDate}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value">
                <span class="status ${transaction.status}">${transaction.status.toUpperCase()}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Account Holder</div>
              <div class="info-value">${profile?.full_name || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value">${profile?.email || 'N/A'}</div>
            </div>
          </div>
        </div>

        ${payoutMethod ? `
        <div class="receipt-info">
          <h2>Payout Destination</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Bank Name</div>
              <div class="info-value">${payoutMethod.bank_name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Account Number</div>
              <div class="info-value">${payoutMethod.account_number}</div>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
              <div class="info-label">Account Name</div>
              <div class="info-value">${payoutMethod.account_name}</div>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="amount-section">
          <div class="label">Total Amount</div>
          <div class="amount">${transaction.currency} ${transaction.amount.toFixed(2)}</div>
        </div>

        <div class="breakdown">
          <div class="breakdown-row">
            <span class="breakdown-label">Withdrawal Amount</span>
            <span class="breakdown-value">${transaction.currency} ${transaction.amount.toFixed(2)}</span>
          </div>
          ${transaction.fee ? `
          <div class="breakdown-row">
            <span class="breakdown-label">Processing Fee</span>
            <span class="breakdown-value">-${transaction.currency} ${transaction.fee.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="breakdown-row total">
            <span class="breakdown-label">Net Amount</span>
            <span class="breakdown-value">${transaction.currency} ${transaction.net_amount.toFixed(2)}</span>
          </div>
        </div>

        ${transaction.description ? `
        <div class="receipt-info" style="margin-top: 30px;">
          <h2>Description</h2>
          <p style="margin: 10px 0 0 0; color: #666;">${transaction.description}</p>
        </div>
        ` : ''}

        <div class="receipt-info" style="margin-top: 30px;">
          <h2>Transaction Timeline</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Requested At</div>
              <div class="info-value">${receiptDate}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Completed At</div>
              <div class="info-value">${completedDate}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Murranno Music</strong></p>
          <p>This is an official receipt for your transaction.</p>
          <p>For inquiries, contact support@murrannomusic.com</p>
          <p>Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="receipt-${transaction.reference}.html"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating receipt:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
