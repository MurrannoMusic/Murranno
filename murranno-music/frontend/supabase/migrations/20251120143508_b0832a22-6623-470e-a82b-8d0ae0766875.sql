-- Add videos column to promotion_services table
ALTER TABLE promotion_services
ADD COLUMN videos text[] DEFAULT '{}'::text[];