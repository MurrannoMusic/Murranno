-- Add new columns to releases table for enhanced upload fields
ALTER TABLE "public"."releases"
ADD COLUMN IF NOT EXISTS "is_existing_release" BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS "upc" TEXT,
    ADD COLUMN IF NOT EXISTS "isrc" TEXT,
    ADD COLUMN IF NOT EXISTS "distribution_platforms" TEXT [];
-- Add comments for documentation
COMMENT ON COLUMN "public"."releases"."is_existing_release" IS 'Indicates if this is an existing release or a new one';
COMMENT ON COLUMN "public"."releases"."upc" IS 'Universal Product Code for the release';
COMMENT ON COLUMN "public"."releases"."isrc" IS 'International Standard Recording Code for the release';
COMMENT ON COLUMN "public"."releases"."distribution_platforms" IS 'List of platforms selected for distribution';