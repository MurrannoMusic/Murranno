-- Create platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name text NOT NULL DEFAULT 'Murranno Music',
  support_email text NOT NULL DEFAULT 'support@murrannomusic.com',
  auto_approve_uploads boolean NOT NULL DEFAULT false,
  content_moderation_enabled boolean NOT NULL DEFAULT true,
  restricted_words text[] DEFAULT ARRAY[]::text[],
  max_uploads_per_month integer NOT NULL DEFAULT 10,
  max_file_size_mb integer NOT NULL DEFAULT 100,
  payment_processor text NOT NULL DEFAULT 'paystack',
  minimum_payout_amount numeric NOT NULL DEFAULT 5000,
  payout_schedule text NOT NULL DEFAULT 'monthly',
  platform_fee_percentage numeric NOT NULL DEFAULT 15,
  email_notifications_enabled boolean NOT NULL DEFAULT true,
  sms_notifications_enabled boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Create policies - only admins can view and update
CREATE POLICY "Admins can view platform settings"
  ON public.platform_settings
  FOR SELECT
  USING (has_admin_role(auth.uid()));

CREATE POLICY "Admins can update platform settings"
  ON public.platform_settings
  FOR UPDATE
  USING (has_admin_role(auth.uid()));

-- Insert default settings (singleton pattern)
INSERT INTO public.platform_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();