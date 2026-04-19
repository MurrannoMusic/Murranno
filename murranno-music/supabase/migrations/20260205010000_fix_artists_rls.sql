-- Enable RLS on artists table
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own artist profile" ON artists;
DROP POLICY IF EXISTS "Users can insert their own artist profile" ON artists;
DROP POLICY IF EXISTS "Users can update their own artist profile" ON artists;
-- Create comprehensive policies
CREATE POLICY "Users can view their own artist profile" ON artists FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own artist profile" ON artists FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Start with a broad update policy for the owner
CREATE POLICY "Users can update their own artist profile" ON artists FOR
UPDATE USING (auth.uid() = user_id);