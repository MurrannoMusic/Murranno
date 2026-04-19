-- Add new columns for KYC and split names
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS first_name text,
    ADD COLUMN IF NOT EXISTS last_name text,
    ADD COLUMN IF NOT EXISTS phone_number text,
    ADD COLUMN IF NOT EXISTS kyc_tier integer DEFAULT 1,
    ADD COLUMN IF NOT EXISTS kyc_status text DEFAULT 'unverified' CHECK (
        kyc_status IN ('unverified', 'pending', 'verified', 'rejected')
    ),
    ADD COLUMN IF NOT EXISTS nin_number text,
    ADD COLUMN IF NOT EXISTS id_document_url text,
    ADD COLUMN IF NOT EXISTS id_document_type text;
-- Attempt to split existing full_name into first and last name for backward compatibility
UPDATE profiles
SET first_name = split_part(full_name, ' ', 1),
    last_name = substr(
        full_name,
        length(split_part(full_name, ' ', 1)) + 2
    )
WHERE full_name IS NOT NULL
    AND first_name IS NULL;