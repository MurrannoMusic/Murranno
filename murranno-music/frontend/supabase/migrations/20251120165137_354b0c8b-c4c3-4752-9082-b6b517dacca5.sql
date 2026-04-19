-- Add service completion tracking to campaign_services
ALTER TABLE campaign_services 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create cart persistence table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_id UUID REFERENCES promotion_services(id),
  bundle_id UUID REFERENCES promotion_bundles(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT cart_item_type CHECK (
    (service_id IS NOT NULL AND bundle_id IS NULL) OR
    (service_id IS NULL AND bundle_id IS NOT NULL)
  )
);

-- Add RLS policies for cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their cart"
  ON cart_items FOR ALL
  USING (auth.uid() = user_id);

-- Add trigger for cart_items updated_at
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for campaign_services to track completion
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_services;