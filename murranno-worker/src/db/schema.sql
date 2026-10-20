-- Murranno D1 schema (SQLite).
-- Declared column types drive JSON encoding in src/lib/db.ts:
--   BOOLEAN    -> stored 0/1, returned as true/false
--   JSON_TEXT  -> stored as JSON text, returned parsed
--   TEXT_ARRAY -> stored as JSON array text, returned as string[]
--   KOBO       -> money stored as integer kobo, returned as naira (number)
-- Timestamps are ISO-8601 UTC strings so lexical order == time order.

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------- auth ----

CREATE TABLE IF NOT EXISTS auth_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  encrypted_password TEXT,
  email_confirmed_at TEXT,
  last_sign_in_at TEXT,
  raw_user_meta_data JSON_TEXT,
  raw_app_meta_data JSON_TEXT,
  banned_until TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS auth_identities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  identity_data JSON_TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (provider, provider_id)
);
CREATE INDEX IF NOT EXISTS idx_auth_identities_user ON auth_identities(user_id);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  previous_token_hash TEXT,
  -- how the session began: password | otp | recovery | oauth (recovery sessions may reset the password)
  method TEXT NOT NULL DEFAULT 'password',
  rotated_at TEXT,
  user_agent TEXT,
  ip TEXT,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_sessions_refresh ON auth_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_previous ON auth_sessions(previous_token_hash);

-- One-time email codes/links (signup confirmation, recovery, email change)
CREATE TABLE IF NOT EXISTS auth_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('signup', 'recovery', 'email_change')),
  token_hash TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  new_email TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user ON auth_tokens(user_id, type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_tokens_hash ON auth_tokens(token_hash);

-- ------------------------------------------------------------- profiles ----

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  kyc_tier INTEGER DEFAULT 1,
  kyc_status TEXT DEFAULT 'unverified' CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'rejected')),
  nin_number TEXT,
  id_document_url TEXT,
  id_document_type TEXT,
  transaction_pin_hash TEXT,
  pin_failed_attempts INTEGER NOT NULL DEFAULT 0,
  pin_locked_until TEXT,
  payout_lock_until TEXT,
  banned BOOLEAN DEFAULT 0,
  ban_reason TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc ON profiles(kyc_status);

CREATE TABLE IF NOT EXISTS user_roles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'artist' CHECK (tier IN ('artist', 'label', 'agency', 'admin')),
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_user_roles_tier ON user_roles(tier);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('artist', 'label', 'agency', 'admin')),
  price_monthly KOBO NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  max_artists INTEGER,
  features JSON_TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('artist', 'label', 'agency', 'admin')),
  status TEXT NOT NULL DEFAULT 'trial',
  trial_ends_at TEXT,
  current_period_start TEXT,
  current_period_end TEXT,
  cancelled_at TEXT,
  refunded_at TEXT,
  paystack_customer_code TEXT,
  paystack_subscription_code TEXT,
  admin_notes TEXT,
  manually_managed BOOLEAN DEFAULT 0,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (user_id, tier)
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT 1,
  push_notifications BOOLEAN NOT NULL DEFAULT 1,
  in_app_notifications BOOLEAN NOT NULL DEFAULT 1,
  release_updates BOOLEAN NOT NULL DEFAULT 1,
  campaign_updates BOOLEAN NOT NULL DEFAULT 1,
  earnings_alerts BOOLEAN NOT NULL DEFAULT 1,
  marketing_emails BOOLEAN NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT 0,
  read_at TEXT,
  related_id TEXT,
  related_type TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at);

CREATE TABLE IF NOT EXISTS push_notification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL,
  device_info JSON_TEXT,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (user_id, token)
);

CREATE TABLE IF NOT EXISTS security_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  details JSON_TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_security_logs_user ON security_logs(user_id, created_at);

-- -------------------------------------------------------------- catalog ----

CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  stage_name TEXT NOT NULL,
  bio TEXT,
  profile_image TEXT,
  spotify_id TEXT,
  spotify_url TEXT,
  apple_music_id TEXT,
  apple_music_url TEXT,
  audiomack_url TEXT,
  soundcloud_url TEXT,
  deezer_url TEXT,
  tidal_url TEXT,
  youtube_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  tiktok_url TEXT,
  twitter_url TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
-- One artist profile per account (label-created artists have no user_id).
CREATE UNIQUE INDEX IF NOT EXISTS idx_artists_user ON artists(user_id) WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS releases (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  release_type TEXT NOT NULL,
  release_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Pending', 'Published', 'Rejected', 'Takedown')),
  genre TEXT,
  secondary_genre TEXT,
  description TEXT,
  label TEXT,
  language TEXT DEFAULT 'English',
  copyright TEXT,
  copyright_holder TEXT,
  recording_year TEXT,
  upc_ean TEXT,
  upc TEXT,
  isrc TEXT,
  smartlink TEXT,
  cover_art_url TEXT,
  is_existing_release BOOLEAN DEFAULT 0,
  distribution_platforms TEXT_ARRAY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_releases_artist ON releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);

CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  release_id TEXT NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  track_number INTEGER NOT NULL DEFAULT 1,
  duration INTEGER NOT NULL DEFAULT 0,
  isrc TEXT,
  audio_file_url TEXT,
  lyrics TEXT,
  songwriter_legal_names TEXT_ARRAY,
  explicit_content BOOLEAN DEFAULT 0,
  featured_artists TEXT_ARRAY,
  producers TEXT_ARRAY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_tracks_release ON tracks(release_id);

CREATE TABLE IF NOT EXISTS streaming_data (
  id TEXT PRIMARY KEY,
  track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  platform TEXT NOT NULL,
  streams INTEGER NOT NULL DEFAULT 0,
  country TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_streaming_track_date ON streaming_data(track_id, date);
CREATE INDEX IF NOT EXISTS idx_streaming_date ON streaming_data(date);

CREATE TABLE IF NOT EXISTS earnings (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  release_id TEXT REFERENCES releases(id) ON DELETE SET NULL,
  track_id TEXT REFERENCES tracks(id) ON DELETE SET NULL,
  amount KOBO NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  source TEXT NOT NULL,
  platform TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_earnings_artist ON earnings(artist_id, period_start);
CREATE INDEX IF NOT EXISTS idx_earnings_release ON earnings(release_id);

CREATE TABLE IF NOT EXISTS label_artists (
  id TEXT PRIMARY KEY,
  label_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  revenue_share_percentage REAL,
  contract_start_date TEXT,
  contract_end_date TEXT,
  payout_schedule TEXT,
  total_paid_out KOBO DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (label_id, artist_id)
);
CREATE INDEX IF NOT EXISTS idx_label_artists_artist ON label_artists(artist_id);

CREATE TABLE IF NOT EXISTS agency_clients (
  id TEXT PRIMARY KEY,
  agency_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  commission_percentage REAL,
  contract_details JSON_TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (agency_id, client_id)
);
CREATE INDEX IF NOT EXISTS idx_agency_clients_client ON agency_clients(client_id);

-- --------------------------------------------------------------- wallet ----

CREATE TABLE IF NOT EXISTS wallet_balance (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  available_balance KOBO NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
  pending_balance KOBO NOT NULL DEFAULT 0 CHECK (pending_balance >= 0),
  total_earnings KOBO NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NGN',
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS payout_methods (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'bank',
  recipient_code TEXT NOT NULL,
  bank_code TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  is_primary BOOLEAN DEFAULT 0,
  is_verified BOOLEAN DEFAULT 0,
  metadata JSON_TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_payout_methods_user ON payout_methods(user_id);

CREATE TABLE IF NOT EXISTS withdrawal_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  payout_method_id TEXT REFERENCES payout_methods(id) ON DELETE SET NULL,
  amount KOBO NOT NULL CHECK (amount > 0),
  fee KOBO DEFAULT 0,
  net_amount KOBO NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'pending',
  reference TEXT NOT NULL UNIQUE,
  transfer_code TEXT,
  description TEXT,
  failure_reason TEXT,
  admin_notes TEXT,
  paystack_response JSON_TEXT,
  requested_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  scheduled_for TEXT,
  reviewed_at TEXT,
  reviewed_by TEXT,
  completed_at TEXT,
  ip_address TEXT,
  user_agent TEXT,
  previous_hash TEXT,
  hash TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawal_transactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawal_transactions(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_withdrawals_transfer ON withdrawal_transactions(transfer_code);

-- Ledger integrity: money fields and the hash chain can never change; rows can never be deleted.
-- Status/review columns stay writable so the payout workflow can progress.
CREATE TRIGGER IF NOT EXISTS trg_withdrawals_immutable
BEFORE UPDATE OF amount, fee, net_amount, reference, hash, previous_hash, created_at ON withdrawal_transactions
BEGIN
  SELECT RAISE(ABORT, 'withdrawal_transactions financial fields are append-only');
END;

CREATE TRIGGER IF NOT EXISTS trg_withdrawals_no_delete
BEFORE DELETE ON withdrawal_transactions
BEGIN
  SELECT RAISE(ABORT, 'withdrawal_transactions are append-only');
END;

CREATE TABLE IF NOT EXISTS idempotency_keys (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  response_body JSON_TEXT,
  status TEXT NOT NULL DEFAULT 'started',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  expires_at TEXT NOT NULL,
  UNIQUE (user_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON idempotency_keys(expires_at);

CREATE TABLE IF NOT EXISTS withdrawal_otps (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  withdrawal_id TEXT,
  is_used BOOLEAN DEFAULT 0,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Paystack charges already applied (webhook + redirect idempotency)
CREATE TABLE IF NOT EXISTS payments (
  reference TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  kind TEXT NOT NULL,
  amount KOBO NOT NULL,
  metadata JSON_TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ----------------------------------------------------------- promotions ----

CREATE TABLE IF NOT EXISTS promotion_services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  price KOBO NOT NULL,
  duration TEXT,
  features JSON_TEXT,
  image_url TEXT,
  images TEXT_ARRAY,
  videos TEXT_ARRAY,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS promotion_bundles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price KOBO NOT NULL,
  tier_level INTEGER NOT NULL,
  target_description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS bundle_services (
  id TEXT PRIMARY KEY,
  bundle_id TEXT NOT NULL REFERENCES promotion_bundles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  service_id TEXT NOT NULL REFERENCES promotion_services(id) ON DELETE CASCADE ON UPDATE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (bundle_id, service_id)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id TEXT REFERENCES promotion_services(id) ON DELETE CASCADE,
  bundle_id TEXT REFERENCES promotion_bundles(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artist_id TEXT REFERENCES artists(id) ON DELETE SET NULL,
  release_id TEXT REFERENCES releases(id) ON DELETE SET NULL,
  bundle_id TEXT REFERENCES promotion_bundles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  platform TEXT NOT NULL,
  category TEXT,
  promotion_type TEXT,
  budget KOBO NOT NULL DEFAULT 0,
  spent KOBO NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Draft',
  start_date TEXT NOT NULL,
  end_date TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_reference TEXT,
  payment_amount KOBO,
  campaign_assets JSON_TEXT,
  campaign_brief TEXT,
  target_audience JSON_TEXT,
  social_links JSON_TEXT,
  admin_notes TEXT,
  rejection_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_campaigns_user ON campaigns(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_artist ON campaigns(artist_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_release ON campaigns(release_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_reference ON campaigns(payment_reference);

CREATE TABLE IF NOT EXISTS campaign_services (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES promotion_services(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_campaign_services_campaign ON campaign_services(campaign_id);

CREATE TABLE IF NOT EXISTS campaign_metrics (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  reach INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  engagement REAL NOT NULL DEFAULT 0,
  spend KOBO NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (campaign_id, date)
);

-- ---------------------------------------------------------------- admin ----

CREATE TABLE IF NOT EXISTS platform_settings (
  id TEXT PRIMARY KEY,
  platform_name TEXT NOT NULL DEFAULT 'Murranno Music',
  support_email TEXT NOT NULL DEFAULT 'support@murrannomusic.co',
  auto_approve_uploads BOOLEAN NOT NULL DEFAULT 0,
  content_moderation_enabled BOOLEAN NOT NULL DEFAULT 1,
  restricted_words TEXT_ARRAY,
  max_uploads_per_month INTEGER NOT NULL DEFAULT 10,
  max_file_size_mb INTEGER NOT NULL DEFAULT 100,
  payment_processor TEXT NOT NULL DEFAULT 'paystack',
  minimum_payout_amount KOBO NOT NULL DEFAULT 100000,
  payout_schedule TEXT NOT NULL DEFAULT 'monthly',
  platform_fee_percentage REAL NOT NULL DEFAULT 15,
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT 1,
  sms_notifications_enabled BOOLEAN NOT NULL DEFAULT 0,
  maintenance_mode BOOLEAN DEFAULT 0,
  usd_to_ngn_rate REAL DEFAULT 1600,
  help_center_url TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  terms_url TEXT,
  privacy_url TEXT,
  social_instagram TEXT,
  social_twitter TEXT,
  social_facebook TEXT,
  social_linkedin TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  ip_address TEXT,
  metadata JSON_TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_logs(created_at);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_id TEXT,
  details JSON_TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS system_announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT,
  email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  admin_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
