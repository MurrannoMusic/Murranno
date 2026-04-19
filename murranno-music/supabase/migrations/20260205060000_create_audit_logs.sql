-- Ensure admin_audit_logs table exists and has correct columns
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id uuid REFERENCES auth.users(id) NOT NULL,
    action text NOT NULL,
    target_type text NOT NULL,
    target_id text NOT NULL,
    metadata jsonb,
    created_at timestamptz DEFAULT now()
);
-- Ensure columns exist (in case table existed with different schema)
ALTER TABLE public.admin_audit_logs
ADD COLUMN IF NOT EXISTS admin_id uuid REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS action text,
    ADD COLUMN IF NOT EXISTS target_type text,
    ADD COLUMN IF NOT EXISTS target_id text,
    ADD COLUMN IF NOT EXISTS metadata jsonb;
-- Enable RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
-- Re-create policies using the RPC
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs FOR
SELECT USING (public.has_admin_role(auth.uid()));
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs FOR
INSERT WITH CHECK (public.has_admin_role(auth.uid()));