-- Create push_notification_tokens table to store device tokens
CREATE TABLE IF NOT EXISTS public.push_notification_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_info JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_notification_tokens ENABLE ROW LEVEL SECURITY;

-- Users can insert their own tokens
CREATE POLICY "Users can insert their own tokens" 
ON public.push_notification_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tokens
CREATE POLICY "Users can update their own tokens" 
ON public.push_notification_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can view their own tokens
CREATE POLICY "Users can view their own tokens" 
ON public.push_notification_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can delete their own tokens
CREATE POLICY "Users can delete their own tokens" 
ON public.push_notification_tokens 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can view all tokens
CREATE POLICY "Admins can view all tokens" 
ON public.push_notification_tokens 
FOR SELECT 
USING (has_admin_role(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_push_notification_tokens_updated_at
BEFORE UPDATE ON public.push_notification_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_push_tokens_user_id ON public.push_notification_tokens(user_id);
CREATE INDEX idx_push_tokens_active ON public.push_notification_tokens(is_active) WHERE is_active = true;