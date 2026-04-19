-- Add lyrics column to tracks table
ALTER TABLE "public"."tracks"
ADD COLUMN IF NOT EXISTS "lyrics" TEXT;
-- Add comment
COMMENT ON COLUMN "public"."tracks"."lyrics" IS 'Lyrics for the track';