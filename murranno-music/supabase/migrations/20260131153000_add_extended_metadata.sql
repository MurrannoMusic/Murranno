-- Add extended metadata columns
ALTER TABLE "public"."releases"
ADD COLUMN IF NOT EXISTS "language" text DEFAULT 'English';
ALTER TABLE "public"."releases"
ADD COLUMN IF NOT EXISTS "recording_year" text;
ALTER TABLE "public"."releases"
ADD COLUMN IF NOT EXISTS "copyright_holder" text;
-- Add strict credit columns
ALTER TABLE "public"."tracks"
ADD COLUMN IF NOT EXISTS "songwriter_legal_names" text [];