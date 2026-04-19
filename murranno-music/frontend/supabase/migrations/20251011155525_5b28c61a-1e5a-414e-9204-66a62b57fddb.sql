-- Create artists table
CREATE TABLE public.artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  bio TEXT,
  profile_image TEXT,
  spotify_id TEXT,
  apple_music_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on artists
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- RLS policies for artists
CREATE POLICY "Artists can view their own profile"
  ON public.artists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Artists can update their own profile"
  ON public.artists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Artists can insert their own profile"
  ON public.artists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create label_artists junction table
CREATE TABLE public.label_artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label_id UUID NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  contract_start_date DATE,
  contract_end_date DATE,
  revenue_share_percentage NUMERIC(5,2) CHECK (revenue_share_percentage >= 0 AND revenue_share_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(label_id, artist_id)
);

-- Enable RLS on label_artists
ALTER TABLE public.label_artists ENABLE ROW LEVEL SECURITY;

-- RLS policies for label_artists
CREATE POLICY "Labels can view their artists"
  ON public.label_artists FOR SELECT
  USING (auth.uid() = label_id);

CREATE POLICY "Labels can manage their artists"
  ON public.label_artists FOR ALL
  USING (auth.uid() = label_id);

CREATE POLICY "Artists can view their label relationships"
  ON public.label_artists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.artists
      WHERE artists.id = label_artists.artist_id
      AND artists.user_id = auth.uid()
    )
  );

-- Create releases table
CREATE TABLE public.releases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  release_type TEXT NOT NULL CHECK (release_type IN ('Single', 'Album', 'EP')),
  release_date DATE NOT NULL,
  cover_art_url TEXT,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Live', 'Repair', 'Takedown')),
  upc_ean TEXT UNIQUE,
  label TEXT,
  copyright TEXT,
  genre TEXT,
  language TEXT,
  smartlink TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on releases
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;

-- RLS policies for releases
CREATE POLICY "Artists can view their own releases"
  ON public.releases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.artists
      WHERE artists.id = releases.artist_id
      AND artists.user_id = auth.uid()
    )
  );

CREATE POLICY "Artists can manage their own releases"
  ON public.releases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.artists
      WHERE artists.id = releases.artist_id
      AND artists.user_id = auth.uid()
    )
  );

CREATE POLICY "Labels can view their artists' releases"
  ON public.releases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.label_artists
      WHERE label_artists.artist_id = releases.artist_id
      AND label_artists.label_id = auth.uid()
      AND label_artists.status = 'active'
    )
  );

-- Create tracks table
CREATE TABLE public.tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL,
  isrc TEXT UNIQUE,
  track_number INTEGER NOT NULL,
  audio_file_url TEXT,
  lyrics TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tracks
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- RLS policies for tracks
CREATE POLICY "Users can view tracks of accessible releases"
  ON public.tracks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.releases
      JOIN public.artists ON artists.id = releases.artist_id
      WHERE releases.id = tracks.release_id
      AND (
        artists.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.label_artists
          WHERE label_artists.artist_id = artists.id
          AND label_artists.label_id = auth.uid()
          AND label_artists.status = 'active'
        )
      )
    )
  );

CREATE POLICY "Artists can manage their own tracks"
  ON public.tracks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.releases
      JOIN public.artists ON artists.id = releases.artist_id
      WHERE releases.id = tracks.release_id
      AND artists.user_id = auth.uid()
    )
  );

-- Create streaming_data table
CREATE TABLE public.streaming_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  streams BIGINT NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  country TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(track_id, platform, date, country)
);

-- Enable RLS on streaming_data
ALTER TABLE public.streaming_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for streaming_data
CREATE POLICY "Users can view streaming data for accessible tracks"
  ON public.streaming_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tracks
      JOIN public.releases ON releases.id = tracks.release_id
      JOIN public.artists ON artists.id = releases.artist_id
      WHERE tracks.id = streaming_data.track_id
      AND (
        artists.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.label_artists
          WHERE label_artists.artist_id = artists.id
          AND label_artists.label_id = auth.uid()
          AND label_artists.status = 'active'
        )
      )
    )
  );

-- Create earnings table
CREATE TABLE public.earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID REFERENCES public.tracks(id) ON DELETE SET NULL,
  release_id UUID REFERENCES public.releases(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  source TEXT NOT NULL CHECK (source IN ('streaming', 'download', 'campaign', 'royalty', 'other')),
  platform TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on earnings
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;

-- RLS policies for earnings
CREATE POLICY "Artists can view their own earnings"
  ON public.earnings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.artists
      WHERE artists.id = earnings.artist_id
      AND artists.user_id = auth.uid()
    )
  );

CREATE POLICY "Labels can view their artists' earnings"
  ON public.earnings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.label_artists
      WHERE label_artists.artist_id = earnings.artist_id
      AND label_artists.label_id = auth.uid()
      AND label_artists.status = 'active'
    )
  );

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  release_id UUID REFERENCES public.releases(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('TikTok', 'Instagram', 'YouTube', 'Spotify', 'Multi-Platform')),
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Paused', 'Completed')),
  budget NUMERIC(12,2) NOT NULL,
  spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaigns
CREATE POLICY "Users can view their own campaigns"
  ON public.campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own campaigns"
  ON public.campaigns FOR ALL
  USING (auth.uid() = user_id);

-- Create campaign_metrics table
CREATE TABLE public.campaign_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  reach BIGINT NOT NULL DEFAULT 0,
  impressions BIGINT NOT NULL DEFAULT 0,
  engagement BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  conversions BIGINT NOT NULL DEFAULT 0,
  spend NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, date)
);

-- Enable RLS on campaign_metrics
ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_metrics
CREATE POLICY "Users can view metrics for their campaigns"
  ON public.campaign_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_metrics.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON public.artists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_label_artists_updated_at
  BEFORE UPDATE ON public.label_artists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_releases_updated_at
  BEFORE UPDATE ON public.releases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at
  BEFORE UPDATE ON public.tracks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_streaming_data_updated_at
  BEFORE UPDATE ON public.streaming_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_earnings_updated_at
  BEFORE UPDATE ON public.earnings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_metrics_updated_at
  BEFORE UPDATE ON public.campaign_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('track-uploads', 'track-uploads', false),
  ('cover-art', 'cover-art', true),
  ('profile-images', 'profile-images', true);

-- Storage RLS policies for track-uploads
CREATE POLICY "Users can upload their own tracks"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'track-uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own tracks"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'track-uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own tracks"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'track-uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS policies for cover-art
CREATE POLICY "Anyone can view cover art"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cover-art');

CREATE POLICY "Users can upload cover art"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cover-art' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own cover art"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cover-art' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS policies for profile-images
CREATE POLICY "Anyone can view profile images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );