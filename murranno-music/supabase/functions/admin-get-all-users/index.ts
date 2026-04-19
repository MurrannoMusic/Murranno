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

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin role
    const { data: isAdmin } = await supabase.rpc('has_admin_role', { _user_id: user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get pagination and filters from body (preferred) or query params (fallback)
    let page = 1;
    let limit = 50;
    let search = '';
    let tierFilter = '';
    let statusFilter = '';

    try {
      if (req.method === 'POST') {
        const body = await req.json();
        page = parseInt(String(body?.page ?? '1'));
        limit = parseInt(String(body?.limit ?? '50'));
        search = String(body?.search ?? '');
        tierFilter = String(body?.tier ?? '');
        statusFilter = String(body?.status ?? '');
      } else {
        const url = new URL(req.url);
        page = parseInt(url.searchParams.get('page') || '1');
        limit = parseInt(url.searchParams.get('limit') || '50');
        search = url.searchParams.get('search') || '';
        tierFilter = url.searchParams.get('tier') || '';
        statusFilter = url.searchParams.get('status') || '';
      }
    } catch (_) {
      // Fallback to defaults if parsing fails
    }

    const offset = (page - 1) * limit;

    // Build query - fetch profiles first, then join related data
    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        created_at,
        updated_at
      `, { count: 'exact' });

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: profiles, error: profilesError, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Fetch user roles and subscriptions separately for each user
    const userIds = profiles?.map(p => p.id) || [];
    
    const { data: roles } = await supabase
      .from('user_roles')
      .select('*')
      .in('user_id', userIds);

    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .in('user_id', userIds);

    // Combine the data
    const users = profiles?.map(profile => ({
      ...profile,
      user_roles: roles?.filter(r => r.user_id === profile.id) || [],
      subscriptions: subscriptions?.filter(s => s.user_id === profile.id) || [],
    })) || [];

    // Apply additional filters
    let filteredUsers = users;
    
    if (tierFilter) {
      filteredUsers = filteredUsers.filter(u => 
        u.user_roles.some(r => r.tier === tierFilter)
      );
    }

    if (statusFilter) {
      filteredUsers = filteredUsers.filter(u => 
        u.subscriptions.some(s => s.status === statusFilter)
      );
    }

    // Log admin action
    await supabase.from('admin_audit_logs').insert({
      admin_id: user.id,
      action: 'VIEW_ALL_USERS',
      target_type: 'users',
      metadata: { page, limit, search, tierFilter, statusFilter },
    });

    return new Response(JSON.stringify({
      success: true,
      users: filteredUsers,
      total: filteredUsers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredUsers.length / limit),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});