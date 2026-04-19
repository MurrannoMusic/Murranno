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
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: isAdmin, error: roleError } = await supabase.rpc('has_admin_role', {
      _user_id: user.id
    });

    if (roleError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { campaignIds, action, rejectionReason } = await req.json();

    if (!campaignIds || !Array.isArray(campaignIds) || campaignIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Campaign IDs array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let status: string;
    let updates: any = { updated_at: new Date().toISOString() };

    switch (action) {
      case 'approve':
        status = 'Active';
        break;
      case 'reject':
        status = 'Rejected';
        if (rejectionReason) {
          updates.rejection_reason = rejectionReason;
        }
        break;
      case 'pause':
        status = 'Paused';
        break;
      case 'activate':
        status = 'Active';
        break;
      case 'delete':
        // Delete campaigns
        const { error: deleteError } = await supabase
          .from('campaigns')
          .delete()
          .in('id', campaignIds);

        if (deleteError) throw deleteError;

        // Log admin action
        await supabase.from('admin_audit_logs').insert({
          admin_id: user.id,
          action: 'bulk_delete_campaigns',
          target_type: 'campaign',
          metadata: { campaign_ids: campaignIds, count: campaignIds.length }
        });

        return new Response(
          JSON.stringify({ success: true, deleted: campaignIds.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    updates.status = status;

    // Update campaigns
    const { data: campaigns, error: updateError } = await supabase
      .from('campaigns')
      .update(updates)
      .in('id', campaignIds)
      .select();

    if (updateError) throw updateError;

    // Send notifications to campaign owners
    const serviceRoleClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    for (const campaign of campaigns || []) {
      let notificationTitle = '';
      let notificationMessage = '';
      let notificationType: 'success' | 'error' | 'info' = 'info';

      switch (action) {
        case 'approve':
          notificationTitle = 'Campaign Approved';
          notificationMessage = `Your campaign "${campaign.name}" has been approved and is now active.`;
          notificationType = 'success';
          break;
        case 'reject':
          notificationTitle = 'Campaign Rejected';
          notificationMessage = `Your campaign "${campaign.name}" has been rejected. ${rejectionReason || ''}`;
          notificationType = 'error';
          break;
        case 'pause':
          notificationTitle = 'Campaign Paused';
          notificationMessage = `Your campaign "${campaign.name}" has been paused.`;
          notificationType = 'info';
          break;
        case 'activate':
          notificationTitle = 'Campaign Activated';
          notificationMessage = `Your campaign "${campaign.name}" has been activated.`;
          notificationType = 'success';
          break;
      }

      await serviceRoleClient.from('notifications').insert({
        user_id: campaign.user_id,
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        related_type: 'campaign',
        related_id: campaign.id
      });
    }

    // Log admin action
    await supabase.from('admin_audit_logs').insert({
      admin_id: user.id,
      action: `bulk_${action}_campaigns`,
      target_type: 'campaign',
      metadata: { 
        campaign_ids: campaignIds, 
        count: campaignIds.length,
        status,
        rejection_reason: rejectionReason 
      }
    });

    return new Response(
      JSON.stringify({ success: true, updated: campaigns?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Bulk update campaigns error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
