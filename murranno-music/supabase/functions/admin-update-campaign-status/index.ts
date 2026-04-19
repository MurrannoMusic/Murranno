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

    // Check if user has admin role
    const { data: isAdmin, error: roleError } = await supabase.rpc('has_admin_role', {
      _user_id: user.id
    });

    if (roleError || !isAdmin) {
      console.error('Authorization error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { campaignId, status, adminNotes, rejectionReason } = await req.json();

    if (!campaignId || !status) {
      return new Response(
        JSON.stringify({ error: 'Campaign ID and status are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Updating campaign status:', { campaignId, status });

    // Get the current campaign to store old status BEFORE update
    const { data: oldCampaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('status')
      .eq('id', campaignId)
      .single();

    if (fetchError) throw fetchError;
    const oldStatus = oldCampaign?.status || 'unknown';

    // Build update object
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (adminNotes !== undefined) {
      updates.admin_notes = adminNotes;
    }

    if (rejectionReason !== undefined) {
      updates.rejection_reason = rejectionReason;
    }

    // Update campaign
    const { data: campaign, error: updateError } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', campaignId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log admin action
    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: user.id,
        action: 'update_campaign_status',
        target_type: 'campaign',
        target_id: campaignId,
        metadata: {
          old_status: oldStatus,
          new_status: status,
          admin_notes: adminNotes,
          rejection_reason: rejectionReason,
        },
      });

    // Send campaign status email notification
    try {
      const { error: emailError } = await supabase.functions.invoke('send-campaign-status-email', {
        body: {
          campaignId,
          oldStatus,
          newStatus: status,
          rejectionReason
        }
      });

      if (emailError) {
        console.error('Failed to send campaign status email:', emailError);
        // Don't fail the whole operation if email fails
      }
    } catch (emailErr) {
      console.error('Error invoking send-campaign-status-email:', emailErr);
    }

    console.log('Campaign status updated successfully:', campaign.id);

    return new Response(
      JSON.stringify({ success: true, campaign }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Update campaign status error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
