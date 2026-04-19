-- Create agency_clients table for agency-artist relationships
CREATE TABLE IF NOT EXISTS public.agency_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL,
  client_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  commission_percentage NUMERIC(5,2) DEFAULT 15.00,
  contract_details JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agency_id, client_id)
);

-- Add missing fields to label_artists table
ALTER TABLE public.label_artists 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS payout_schedule TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS total_paid_out NUMERIC DEFAULT 0;

-- Enable RLS on agency_clients
ALTER TABLE public.agency_clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agency_clients
CREATE POLICY "Agencies can manage their clients"
ON public.agency_clients
FOR ALL
USING (auth.uid() = agency_id);

CREATE POLICY "Artists can view agencies they're connected to"
ON public.agency_clients
FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Admins can view all agency clients"
ON public.agency_clients
FOR SELECT
USING (has_admin_role(auth.uid()));

-- Create trigger for updating updated_at
CREATE TRIGGER update_agency_clients_updated_at
BEFORE UPDATE ON public.agency_clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();