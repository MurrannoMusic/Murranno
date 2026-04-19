-- Enable the HTTP extension for making HTTP requests from the database
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Update the handle_new_user function to send welcome email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  service_role_key text;
  supabase_url text;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Create user role (admin for murrannomusic@gmail.com, otherwise artist)
  INSERT INTO public.user_roles (user_id, tier)
  VALUES (
    NEW.id, 
    CASE 
      WHEN NEW.email = 'murrannomusic@gmail.com' THEN 'admin'::user_tier
      ELSE 'artist'::user_tier
    END
  );
  
  -- Create subscription (admin with active status for murrannomusic@gmail.com, otherwise trial)
  INSERT INTO public.subscriptions (user_id, tier, status, trial_ends_at, current_period_start)
  VALUES (
    NEW.id,
    CASE 
      WHEN NEW.email = 'murrannomusic@gmail.com' THEN 'admin'::user_tier
      ELSE 'artist'::user_tier
    END,
    CASE 
      WHEN NEW.email = 'murrannomusic@gmail.com' THEN 'active'
      ELSE 'trial'
    END,
    CASE 
      WHEN NEW.email = 'murrannomusic@gmail.com' THEN NULL
      ELSE NOW() + INTERVAL '14 days'
    END,
    NOW()
  );
  
  -- Create wallet balance
  INSERT INTO public.wallet_balance (user_id, available_balance, pending_balance, total_earnings)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get environment variables for edge function call
  SELECT value INTO supabase_url FROM public.platform_settings WHERE id = (SELECT id FROM public.platform_settings LIMIT 1);
  
  -- Send welcome email via edge function (async, non-blocking)
  PERFORM extensions.http((
    'POST',
    current_setting('app.settings.supabase_url', true) || '/functions/v1/send-welcome-email',
    ARRAY[
      extensions.http_header('Content-Type', 'application/json'),
      extensions.http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true))
    ],
    'application/json',
    json_build_object('userId', NEW.id)::text
  )::extensions.http_request);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Function to send release status email (triggered by release status updates)
CREATE OR REPLACE FUNCTION public.send_release_status_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only send email if status changed to approved or rejected
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND 
      NEW.status IN ('approved', 'rejected', 'live')) THEN
    
    -- Send release status email via edge function (async, non-blocking)
    PERFORM extensions.http((
      'POST',
      current_setting('app.settings.supabase_url', true) || '/functions/v1/send-release-status-email',
      ARRAY[
        extensions.http_header('Content-Type', 'application/json'),
        extensions.http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true))
      ],
      'application/json',
      json_build_object(
        'releaseId', NEW.id,
        'status', NEW.status
      )::text
    )::extensions.http_request);
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the release update
    RAISE WARNING 'Error in send_release_status_email: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger for release status email
DROP TRIGGER IF EXISTS on_release_status_change ON public.releases;
CREATE TRIGGER on_release_status_change
  AFTER UPDATE ON public.releases
  FOR EACH ROW
  EXECUTE FUNCTION public.send_release_status_email();

-- Set the runtime config for the functions (these need to be set via environment or at runtime)
-- Note: In production, these should be set via ALTER DATABASE SET or connection parameters
COMMENT ON FUNCTION public.handle_new_user() IS 'Requires app.settings.supabase_url and app.settings.service_role_key runtime settings';
COMMENT ON FUNCTION public.send_release_status_email() IS 'Requires app.settings.supabase_url and app.settings.service_role_key runtime settings';