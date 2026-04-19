-- Add images array column to promotion_services table
ALTER TABLE promotion_services 
ADD COLUMN images text[] DEFAULT '{}';

-- Add comment to explain the column
COMMENT ON COLUMN promotion_services.images IS 'Array of Cloudinary image URLs for service gallery/carousel';