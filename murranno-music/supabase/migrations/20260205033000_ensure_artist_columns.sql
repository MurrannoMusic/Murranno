-- Add all potential URL columns to artists table
ALTER TABLE artists
ADD COLUMN IF NOT EXISTS spotify_url text,
    ADD COLUMN IF NOT EXISTS youtube_url text,
    ADD COLUMN IF NOT EXISTS apple_music_url text,
    ADD COLUMN IF NOT EXISTS audiomack_url text,
    ADD COLUMN IF NOT EXISTS soundcloud_url text,
    ADD COLUMN IF NOT EXISTS deezer_url text,
    ADD COLUMN IF NOT EXISTS tidal_url text,
    ADD COLUMN IF NOT EXISTS instagram_url text,
    ADD COLUMN IF NOT EXISTS facebook_url text,
    ADD COLUMN IF NOT EXISTS tiktok_url text,
    ADD COLUMN IF NOT EXISTS twitter_url text;