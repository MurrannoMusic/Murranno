-- Add streaming platform and social media URL columns to artists table
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS spotify_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS audiomack_url TEXT,
ADD COLUMN IF NOT EXISTS soundcloud_url TEXT,
ADD COLUMN IF NOT EXISTS apple_music_url TEXT,
ADD COLUMN IF NOT EXISTS deezer_url TEXT,
ADD COLUMN IF NOT EXISTS tidal_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT;