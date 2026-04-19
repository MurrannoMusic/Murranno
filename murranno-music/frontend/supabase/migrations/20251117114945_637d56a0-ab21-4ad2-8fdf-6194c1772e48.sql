-- Add image_url columns to promotion services and bundles
ALTER TABLE promotion_services 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE promotion_bundles 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN promotion_services.image_url IS 'URL to promotional service image';
COMMENT ON COLUMN promotion_bundles.image_url IS 'URL to promotional bundle image';