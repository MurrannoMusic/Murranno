-- Phase 1B: Admin Database Foundation (continued)

-- 1. Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.has_admin_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND tier = 'admin'
  )
$$;

-- 2. Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  metadata jsonb,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on admin_audit_logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
ON public.admin_audit_logs
FOR SELECT
TO authenticated
USING (public.has_admin_role(auth.uid()));

-- Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (public.has_admin_role(auth.uid()));

-- 3. Add admin RLS policies to existing tables

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_admin_role(auth.uid()));

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_admin_role(auth.uid()));

-- Admins can view all user_roles
CREATE POLICY "Admins can view all user_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_admin_role(auth.uid()));

-- Admins can update user_roles
CREATE POLICY "Admins can update user_roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_admin_role(auth.uid()));

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (public.has_admin_role(auth.uid()));

-- Admins can update all subscriptions
CREATE POLICY "Admins can update all subscriptions"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (public.has_admin_role(auth.uid()));

-- Admins can view all releases
CREATE POLICY "Admins can view all releases"
ON public.releases
FOR SELECT
TO authenticated
USING (public.has_admin_role(auth.uid()));

-- Admins can update all releases
CREATE POLICY "Admins can update all releases"
ON public.releases
FOR UPDATE
TO authenticated
USING (public.has_admin_role(auth.uid()));

-- Admins can delete any release
CREATE POLICY "Admins can delete any release"
ON public.releases
FOR DELETE
TO authenticated
USING (public.has_admin_role(auth.uid()));

-- Admins can view all campaigns
CREATE POLICY "Admins can view all campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (public.has_admin_role(auth.uid()));

-- Admins can update all campaigns
CREATE POLICY "Admins can update all campaigns"
ON public.campaigns
FOR UPDATE
TO authenticated
USING (public.has_admin_role(auth.uid()));

-- Admins can delete any campaign
CREATE POLICY "Admins can delete any campaign"
ON public.campaigns
FOR DELETE
TO authenticated
USING (public.has_admin_role(auth.uid()));

-- Admins can view all earnings
CREATE POLICY "Admins can view all earnings"
ON public.earnings
FOR SELECT
TO authenticated
USING (public.has_admin_role(auth.uid()));

-- Admins can view all payout_methods
CREATE POLICY "Admins can view all payout_methods"
ON public.payout_methods
FOR SELECT
TO authenticated
USING (public.has_admin_role(auth.uid()));

-- Admins can view all wallet_balance
CREATE POLICY "Admins can view all wallet_balance"
ON public.wallet_balance
FOR SELECT
TO authenticated
USING (public.has_admin_role(auth.uid()));

-- Admins can view all withdrawal_transactions
CREATE POLICY "Admins can view all withdrawal_transactions"
ON public.withdrawal_transactions
FOR SELECT
TO authenticated
USING (public.has_admin_role(auth.uid()));

-- Create index for faster audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.admin_audit_logs(action);