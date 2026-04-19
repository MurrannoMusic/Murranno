-- Add ID columns to artists table
ALTER TABLE artists
ADD COLUMN IF NOT EXISTS spotify_id text,
    ADD COLUMN IF NOT EXISTS apple_music_id text;