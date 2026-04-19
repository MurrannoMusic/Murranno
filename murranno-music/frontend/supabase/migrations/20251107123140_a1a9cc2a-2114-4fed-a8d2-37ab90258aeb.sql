-- Add payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Update campaign status values to include full workflow
-- First, add new columns to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_reference text,
ADD COLUMN IF NOT EXISTS payment_amount numeric,
ADD COLUMN IF NOT EXISTS campaign_assets jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS campaign_brief text,
ADD COLUMN IF NOT EXISTS target_audience jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Add comment to clarify status workflow
COMMENT ON COLUMN campaigns.status IS 'Campaign status: Draft, Pending Payment, Paid, In Review, Active, Paused, Completed, Rejected, Cancelled';

-- Create index for payment_status for faster queries
CREATE INDEX IF NOT EXISTS idx_campaigns_payment_status ON campaigns(payment_status);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);