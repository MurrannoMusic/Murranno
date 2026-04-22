-- Phase 2: Settlement Security (Idempotency & Velocity Limits)

-- 1. Idempotency Keys Table
-- Used to prevent duplicate transfers from multiple clicks or retries
CREATE TABLE IF NOT EXISTS "public"."idempotency_keys" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "idempotency_key" text NOT NULL UNIQUE,
    "user_id" uuid REFERENCES "auth"."users"("id") NOT NULL,
    "action" text NOT NULL, -- e.g., 'withdrawal'
    "response_body" jsonb, -- cache the response to return for retries
    "status" text DEFAULT 'started' NOT NULL, -- started, completed, failed
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "expires_at" timestamp with time zone DEFAULT (now() + interval '24 hours') NOT NULL
);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON "public"."idempotency_keys" ("expires_at");

-- 2. Velocity Tracking RPC
-- Checks if a user has exceeded withdrawal limits in the last 24 hours
CREATE OR REPLACE FUNCTION check_withdrawal_velocity(p_user_id UUID, p_amount NUMERIC)
RETURNS BOOLEAN AS $$
DECLARE
    daily_total NUMERIC;
    DAILY_LIMIT NUMERIC := 500000; -- 500,000 NGN daily limit
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO daily_total
    FROM public.withdrawal_transactions
    WHERE user_id = p_user_id 
      AND status != 'rejected'
      AND created_at > (now() - interval '24 hours');

    IF (daily_total + p_amount) > DAILY_LIMIT THEN
        RETURN FALSE; -- Limit exceeded
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 3. Withdrawal OTP Table (Simple implementation)
CREATE TABLE IF NOT EXISTS "public"."withdrawal_otps" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "user_id" uuid REFERENCES "auth"."users"("id") NOT NULL,
    "code" text NOT NULL,
    "withdrawal_id" uuid, -- optional link
    "is_used" boolean DEFAULT false,
    "expires_at" timestamp with time zone DEFAULT (now() + interval '10 minutes') NOT NULL,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
