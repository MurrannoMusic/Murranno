-- Add maintenance_mode to platform_settings
ALTER TABLE "public"."platform_settings"
ADD COLUMN IF NOT EXISTS "maintenance_mode" boolean DEFAULT false;
-- Add comment
COMMENT ON COLUMN "public"."platform_settings"."maintenance_mode" IS 'If true, the platform is in maintenance mode and only admins can access critical features.';