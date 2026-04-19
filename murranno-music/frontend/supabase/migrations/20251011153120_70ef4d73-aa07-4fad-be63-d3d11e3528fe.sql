-- Create user tier enum
CREATE TYPE public.user_tier AS ENUM ('artist', 'label', 'agency');

-- User profiles table (basic user info)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User roles table (separate for security - prevents privilege escalation)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier public.user_tier NOT NULL DEFAULT 'artist',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to get user tier
CREATE OR REPLACE FUNCTION public.get_user_tier(user_id uuid)
RETURNS user_tier
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tier FROM public.user_roles WHERE user_roles.user_id = $1;
$$;

-- User roles RLS policies
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier public.user_tier NOT NULL,
  status text NOT NULL DEFAULT 'trial',
  paystack_subscription_code text,
  paystack_customer_code text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscriptions RLS policies
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Subscription plans table (for reference)
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier public.user_tier NOT NULL UNIQUE,
  name text NOT NULL,
  price_monthly numeric NOT NULL,
  currency text DEFAULT 'NGN',
  features jsonb,
  max_artists integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Plans are publicly readable
CREATE POLICY "Authenticated users can view subscription plans"
  ON public.subscription_plans FOR SELECT
  TO authenticated
  USING (true);

-- Insert initial plans
INSERT INTO public.subscription_plans (tier, name, price_monthly, max_artists, features) VALUES
  ('artist', 'Artist', 0, 1, '["Artist Dashboard", "Upload Tracks", "View Analytics", "Withdraw Earnings"]'::jsonb),
  ('label', 'Label', 10000, 5, '["Label Dashboard", "Manage up to 5 Artists", "Multi-artist Analytics", "Payout Management"]'::jsonb),
  ('agency', 'Agency', 20000, NULL, '["Agency Dashboard", "Unlimited Artists", "Campaign Management", "Advanced Analytics"]'::jsonb);

-- Create trigger function for new user auto-profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Create user role (default to artist)
  INSERT INTO public.user_roles (user_id, tier)
  VALUES (NEW.id, 'artist');
  
  -- Create subscription with 14-day trial
  INSERT INTO public.subscriptions (user_id, tier, status, trial_ends_at, current_period_start)
  VALUES (
    NEW.id,
    'artist',
    'trial',
    NOW() + INTERVAL '14 days',
    NOW()
  );
  
  -- Create wallet balance
  INSERT INTO public.wallet_balance (user_id, available_balance, pending_balance, total_earnings)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic user setup on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for updating updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating updated_at on subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();