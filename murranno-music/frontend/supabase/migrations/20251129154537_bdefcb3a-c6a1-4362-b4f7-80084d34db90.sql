-- Phase 1: Database Schema Updates for Multi-Tier Subscription System

-- 1. Add unique constraint on (user_id, tier) to prevent duplicate subscriptions
-- First, check if there's a unique constraint on user_id and drop it if exists
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_key;

-- Add unique constraint on (user_id, tier) combination
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_tier_unique UNIQUE (user_id, tier);

-- 2. Update handle_new_user trigger to NOT create subscriptions
-- Artist access is implicit/free for all authenticated users
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
  
  -- NO LONGER CREATE SUBSCRIPTION FOR NEW USERS
  -- Artist access is free and implicit for all authenticated users
  -- Only create subscriptions when user purchases Label or Agency add-ons
  
  -- Create wallet balance
  INSERT INTO public.wallet_balance (user_id, available_balance, pending_balance, total_earnings)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- 3. Update subscription_plans pricing
-- Remove artist plan (it's free and doesn't need a subscription)
DELETE FROM public.subscription_plans WHERE tier = 'artist';

-- Update Label plan pricing (₦15,000/month)
UPDATE public.subscription_plans 
SET price_monthly = 15000, 
    currency = 'NGN',
    name = 'Label Access',
    features = jsonb_build_array(
      'Manage multiple artists',
      'Revenue sharing tools',
      'Advanced analytics',
      'Priority support'
    )
WHERE tier = 'label';

-- Update Agency plan pricing (₦25,000/month)
UPDATE public.subscription_plans 
SET price_monthly = 25000,
    currency = 'NGN', 
    name = 'Agency Access',
    features = jsonb_build_array(
      'Manage client campaigns',
      'Commission tracking',
      'Campaign analytics',
      'White-label options',
      'Dedicated account manager'
    )
WHERE tier = 'agency';

-- If plans don't exist, insert them
INSERT INTO public.subscription_plans (tier, name, price_monthly, currency, features, max_artists)
VALUES 
  ('label', 'Label Access', 15000, 'NGN', 
   '["Manage multiple artists", "Revenue sharing tools", "Advanced analytics", "Priority support"]'::jsonb, 
   50),
  ('agency', 'Agency Access', 25000, 'NGN',
   '["Manage client campaigns", "Commission tracking", "Campaign analytics", "White-label options", "Dedicated account manager"]'::jsonb,
   100)
ON CONFLICT (tier) DO UPDATE
SET price_monthly = EXCLUDED.price_monthly,
    name = EXCLUDED.name,
    features = EXCLUDED.features,
    max_artists = EXCLUDED.max_artists;

-- 4. Add helper function to get user's active tiers
CREATE OR REPLACE FUNCTION public.get_user_active_tiers(user_id_param uuid)
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Artist is always available for authenticated users
  SELECT ARRAY['artist']::text[] || COALESCE(
    ARRAY_AGG(tier::text) FILTER (WHERE status = 'active' OR (status = 'trial' AND trial_ends_at > NOW())),
    ARRAY[]::text[]
  )
  FROM public.subscriptions
  WHERE user_id = user_id_param;
$$;