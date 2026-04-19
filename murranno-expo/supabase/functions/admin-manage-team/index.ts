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

        // Authenticate requester
        const authHeader = req.headers.get('Authorization')!;
        const { data: { user: requester }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

        if (authError || !requester) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Check if requester is admin
        const { data: isAdmin } = await supabase.rpc('has_admin_role', { _user_id: requester.id });
        if (!isAdmin) {
            return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const { action, email, userId } = await req.json();

        if (action === 'add') {
            if (!email) throw new Error('Email is required for add action');

            // 1. Find user by email
            // We use admin.listUsers with a filter if possible, or iterate.
            // Easiest for small-ish user bases: list users and find email.
            const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
            if (listError) throw listError;

            const targetUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
            if (!targetUser) {
                return new Response(JSON.stringify({ success: false, error: 'User not found with this email' }), {
                    status: 404,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            // 2. Grant admin role
            const { error: roleError } = await supabase
                .from('user_roles')
                .upsert({ user_id: targetUser.id, tier: 'admin' }, { onConflict: 'user_id' });

            if (roleError) throw roleError;

            // 3. Log action
            await supabase.from('admin_audit_logs').insert({
                admin_id: requester.id,
                action: 'ADD_ADMIN',
                target_type: 'user',
                target_id: targetUser.id,
                metadata: { email }
            });

            return new Response(JSON.stringify({ success: true, message: `User ${email} is now an admin` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });

        } else if (action === 'remove') {
            if (!userId) throw new Error('UserId is required for remove action');

            // Cannot remove yourself (optional safety)
            if (userId === requester.id) {
                throw new Error('You cannot remove yourself from the admin team');
            }

            // 1. Downgrade admin role (set to 'free' or delete)
            const { error: roleError } = await supabase
                .from('user_roles')
                .update({ tier: 'free' })
                .eq('user_id', userId);

            if (roleError) throw roleError;

            // 2. Log action
            await supabase.from('admin_audit_logs').insert({
                admin_id: requester.id,
                action: 'REMOVE_ADMIN',
                target_type: 'user',
                target_id: userId
            });

            return new Response(JSON.stringify({ success: true, message: 'Admin role removed' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });

        } else {
            throw new Error('Invalid action');
        }

    } catch (error: any) {
        console.error('Error managing admin team:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
