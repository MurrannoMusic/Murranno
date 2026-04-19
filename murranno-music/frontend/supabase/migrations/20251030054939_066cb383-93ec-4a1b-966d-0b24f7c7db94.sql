-- Update the handle_new_user function to automatically assign admin role to murrannomusic@gmail.com
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  RETURN NEW;
END;
$function$;