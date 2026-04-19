-- Add columns to subscriptions table for admin management
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS manually_managed BOOLEAN DEFAULT FALSE;

-- Add columns to withdrawal_transactions table for admin review
ALTER TABLE public.withdrawal_transactions
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Add RLS policy for admins to update withdrawal transactions
CREATE POLICY "Admins can update withdrawal_transactions"
ON public.withdrawal_transactions
FOR UPDATE
TO authenticated
USING (has_admin_role(auth.uid()));

-- Add RLS policy for admins to update subscriptions
CREATE POLICY "Admins can update subscriptions"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (has_admin_role(auth.uid()));

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_withdrawal_transactions_status ON public.withdrawal_transactions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier_status ON public.subscriptions(tier, status);