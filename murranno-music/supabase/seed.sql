-- ============================================================
-- MURRANNO DEMO SEED - COMPLETE WITH ALL FIGURES
-- ============================================================
-- PRE-REQUISITE: murrannomusic@gmail.com must exist in
-- Supabase Dashboard → Authentication → Users
-- ============================================================

DO $$
DECLARE
  demo_user_id     UUID;
  demo_artist_id   UUID;
  demo_release1_id UUID := '33333333-3333-3333-3333-333333333333';
  demo_release2_id UUID := '44444444-4444-4444-4444-444444444444';
  demo_track1_id   UUID := '55555555-5555-5555-5555-555555555551';
  demo_track2_id   UUID := '55555555-5555-5555-5555-555555555552';
  demo_track3_id   UUID := '55555555-5555-5555-5555-555555555553';
  demo_track4_id   UUID := '55555555-5555-5555-5555-555555555554';
  demo_track5_id   UUID := '55555555-5555-5555-5555-555555555555';
BEGIN

  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'murrannomusic@gmail.com' LIMIT 1;

  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'User murrannomusic@gmail.com not found in auth.users!';
  END IF;

  RAISE NOTICE 'Seeding for user: %', demo_user_id;

  -- ============================================================
  -- PROFILE
  -- ============================================================
  UPDATE public.profiles SET full_name = 'Murranno Music', updated_at = now() WHERE id = demo_user_id;

  -- ============================================================
  -- SUBSCRIPTION — Agency tier
  -- ============================================================
  INSERT INTO public.subscriptions (id, user_id, tier, status, current_period_start, current_period_end)
  VALUES ('a0000000-0000-0000-0000-000000000001', demo_user_id, 'agency', 'active', now() - interval '5 days', now() + interval '25 days')
  ON CONFLICT (id) DO UPDATE SET status = 'active', current_period_end = now() + interval '25 days';

  -- ============================================================
  -- ARTIST — reuse existing artist if present, else create one
  -- ============================================================
  SELECT id INTO demo_artist_id FROM public.artists WHERE user_id = demo_user_id LIMIT 1;

  IF demo_artist_id IS NULL THEN
    demo_artist_id := gen_random_uuid();
    INSERT INTO public.artists (id, user_id, stage_name, bio, profile_image, spotify_url, apple_music_url, instagram_url, tiktok_url, created_at, updated_at)
    VALUES (
      demo_artist_id, demo_user_id,
      'Murranno',
      'Award-winning Afrobeats/Synthwave producer from Lagos with 2M+ streams across platforms.',
      'https://images.unsplash.com/photo-1549471013-3364d7220b7a',
      'https://open.spotify.com/artist/demo',
      'https://music.apple.com/artist/demo',
      'https://instagram.com/murrannomusic',
      'https://tiktok.com/@murrannomusic',
      now(), now()
    );
  END IF;

  RAISE NOTICE 'Using artist id: %', demo_artist_id;

  -- ============================================================
  -- RELEASES
  -- ============================================================
  INSERT INTO public.releases (id, artist_id, title, status, release_date, release_type, cover_art_url, genre, label, upc_ean, created_at, updated_at)
  VALUES
    (demo_release1_id, demo_artist_id, 'Neon Nights',  'Published', '2026-01-15', 'Album',  'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17', 'Afrobeats', 'Murranno Records', '123456789012', now(), now()),
    (demo_release2_id, demo_artist_id, 'Cyber City',   'Pending',   '2026-06-15', 'Single', 'https://images.unsplash.com/photo-1557683316-973673baf926', 'Afropop',   'Murranno Records', '123456789013', now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================
  -- TRACKS (required for streaming data + top tracks widget)
  -- ============================================================
  INSERT INTO public.tracks (id, release_id, title, track_number, duration, isrc, created_at, updated_at)
  VALUES
    (demo_track1_id, demo_release1_id, 'Lagos Nights',      1, 214, 'NG-XYZ-26-00001', now(), now()),
    (demo_track2_id, demo_release1_id, 'Electric Dreams',   2, 198, 'NG-XYZ-26-00002', now(), now()),
    (demo_track3_id, demo_release1_id, 'Neon Rush',         3, 231, 'NG-XYZ-26-00003', now(), now()),
    (demo_track4_id, demo_release1_id, 'City Lights',       4, 187, 'NG-XYZ-26-00004', now(), now()),
    (demo_track5_id, demo_release1_id, 'Midnight Groove',   5, 205, 'NG-XYZ-26-00005', now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================
  -- STREAMING DATA — 30 days of daily data across platforms
  -- This powers the Analytics chart AND the Top Tracks widget
  -- ============================================================
  DELETE FROM public.streaming_data WHERE track_id IN (demo_track1_id, demo_track2_id, demo_track3_id, demo_track4_id, demo_track5_id);

  INSERT INTO public.streaming_data (id, track_id, date, platform, streams, country, created_at, updated_at)
  SELECT
    gen_random_uuid(),
    t.track_id,
    (current_date - (s.day || ' days')::interval)::date,
    t.platform,
    (random() * t.max_streams + t.min_streams)::int,
    t.country,
    now(), now()
  FROM (VALUES
    (demo_track1_id, 'Spotify',     2000, 8000,  'NG'),
    (demo_track1_id, 'Apple Music', 800,  3000,  'NG'),
    (demo_track1_id, 'Spotify',     1500, 5000,  'US'),
    (demo_track2_id, 'Spotify',     1200, 6000,  'NG'),
    (demo_track2_id, 'Apple Music', 400,  1500,  'GB'),
    (demo_track2_id, 'Audiomack',   800,  4000,  'NG'),
    (demo_track3_id, 'Spotify',     900,  4000,  'NG'),
    (demo_track3_id, 'Deezer',      300,  1200,  'FR'),
    (demo_track4_id, 'Spotify',     600,  3000,  'NG'),
    (demo_track4_id, 'Apple Music', 200,  800,   'US'),
    (demo_track5_id, 'Spotify',     400,  2000,  'NG'),
    (demo_track5_id, 'Audiomack',   500,  2500,  'GH')
  ) AS t(track_id, platform, min_streams, max_streams, country)
  CROSS JOIN generate_series(0, 29) AS s(day);

  -- ============================================================
  -- WALLET BALANCE
  -- ============================================================
  INSERT INTO public.wallet_balance (id, user_id, available_balance, pending_balance, total_earnings, currency, created_at, updated_at)
  VALUES (gen_random_uuid(), demo_user_id, 185420.50, 43200.00, 312500.75, 'NGN', now(), now())
  ON CONFLICT (user_id) DO UPDATE SET
    available_balance = 185420.50,
    pending_balance   = 43200.00,
    total_earnings    = 312500.75,
    updated_at        = now();

  -- ============================================================
  -- CAMPAIGNS
  -- ============================================================
  INSERT INTO public.campaigns (id, user_id, artist_id, release_id, name, platform, status, budget, spent, start_date, end_date, type, campaign_brief, created_at)
  VALUES
    ('c0000000-0000-0000-0000-000000000001', demo_user_id, demo_artist_id, demo_release1_id, 'TikTok Viral Push',      'TikTok',    'Active',    500000, 248000, '2026-04-01', '2026-04-30', 'TikTok',    'Push album to viral via creator challenges', now()),
    ('c0000000-0000-0000-0000-000000000002', demo_user_id, demo_artist_id, demo_release2_id, 'Spotify Playlist Pitch', 'Spotify',   'Completed', 200000, 200000, '2026-03-01', '2026-03-31', 'Spotify',   'Target editorial playlists in Africa + UK', now()),
    ('c0000000-0000-0000-0000-000000000003', demo_user_id, demo_artist_id, demo_release1_id, 'IG Reels Promo',         'Instagram', 'Active',    300000, 87500,  '2026-04-01', '2026-05-15', 'Instagram', 'Visual campaign with 10 creator reposts',   now()),
    ('c0000000-0000-0000-0000-000000000004', demo_user_id, demo_artist_id, demo_release1_id, 'YouTube Pre-save',       'YouTube',   'Draft',     150000, 0,      '2026-05-01', '2026-05-30', 'YouTube',   'Pre-save and lyric video campaign',         now())
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================
  -- CAMPAIGN METRICS — 14 days of performance data
  -- ============================================================
  DELETE FROM public.campaign_metrics WHERE campaign_id IN ('c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003');

  INSERT INTO public.campaign_metrics (id, campaign_id, date, impressions, clicks, conversions, reach, engagement, spend, created_at, updated_at)
  SELECT
    gen_random_uuid(),
    c.campaign_id,
    (current_date - (s.day || ' days')::interval)::date,
    (random() * c.imp_range + c.imp_base)::int,
    (random() * c.clk_range + c.clk_base)::int,
    (random() * 20 + 5)::int,
    (random() * c.rch_range + c.rch_base)::int,
    (random() * c.eng_range + c.eng_base)::int,
    c.daily_spend,
    now(), now()
  FROM (VALUES
    ('c0000000-0000-0000-0000-000000000001'::uuid, 30000, 50000, 800, 1500, 25000, 40000, 1500, 3000, 18000),
    ('c0000000-0000-0000-0000-000000000002'::uuid, 15000, 25000, 400, 800,  12000, 20000, 800,  1500, 14000),
    ('c0000000-0000-0000-0000-000000000003'::uuid, 20000, 35000, 600, 1200, 18000, 30000, 1000, 2000, 6250)
  ) AS c(campaign_id, imp_base, imp_range, clk_base, clk_range, rch_base, rch_range, eng_base, eng_range, daily_spend)
  CROSS JOIN generate_series(0, 13) AS s(day);

  -- ============================================================
  -- NOTIFICATIONS
  -- ============================================================
  INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
  VALUES
    ('e0000000-0000-0000-0000-000000000001', demo_user_id, 'Release Approved!',       '"Neon Nights" has been approved and is now live on all platforms.', 'release',  false, now() - interval '2 hours'),
    ('e0000000-0000-0000-0000-000000000002', demo_user_id, 'Campaign Milestone',      'Your TikTok campaign just hit 1M impressions!',                     'campaign', false, now() - interval '5 hours'),
    ('e0000000-0000-0000-0000-000000000003', demo_user_id, 'Earnings Available',      '₦185,420 is available for withdrawal.',                             'earning',  true,  now() - interval '1 day'),
    ('e0000000-0000-0000-0000-000000000004', demo_user_id, 'New Playlist Placement',  'Lagos Nights was added to Spotify''s "Naija Vibes" playlist.',       'release',  true,  now() - interval '2 days')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✅ Seed complete! Dashboard should now show full figures for murrannomusic@gmail.com';

END $$;
