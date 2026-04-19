-- Create promotion_services table
CREATE TABLE public.promotion_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  duration TEXT,
  features JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promotion_bundles table
CREATE TABLE public.promotion_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC NOT NULL,
  tier_level INTEGER NOT NULL,
  target_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bundle_services junction table
CREATE TABLE public.bundle_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES public.promotion_bundles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.promotion_services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bundle_id, service_id)
);

-- Create campaign_services junction table
CREATE TABLE public.campaign_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.promotion_services(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Extend campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS promotion_type TEXT DEFAULT 'bundle',
ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES public.promotion_bundles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add triggers for updated_at
CREATE TRIGGER update_promotion_services_updated_at
BEFORE UPDATE ON public.promotion_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotion_bundles_updated_at
BEFORE UPDATE ON public.promotion_bundles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_services_updated_at
BEFORE UPDATE ON public.campaign_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.promotion_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promotion_services
CREATE POLICY "Anyone can view active services"
ON public.promotion_services
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage services"
ON public.promotion_services
FOR ALL
USING (has_admin_role(auth.uid()));

-- RLS Policies for promotion_bundles
CREATE POLICY "Anyone can view active bundles"
ON public.promotion_bundles
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage bundles"
ON public.promotion_bundles
FOR ALL
USING (has_admin_role(auth.uid()));

-- RLS Policies for bundle_services
CREATE POLICY "Anyone can view bundle services"
ON public.bundle_services
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage bundle services"
ON public.bundle_services
FOR ALL
USING (has_admin_role(auth.uid()));

-- RLS Policies for campaign_services
CREATE POLICY "Users can view their campaign services"
ON public.campaign_services
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_services.campaign_id
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their campaign services"
ON public.campaign_services
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_services.campaign_id
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all campaign services"
ON public.campaign_services
FOR SELECT
USING (has_admin_role(auth.uid()));

CREATE POLICY "Admins can manage all campaign services"
ON public.campaign_services
FOR ALL
USING (has_admin_role(auth.uid()));