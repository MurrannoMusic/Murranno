-- Enable full access for authenticated users (Admins) on releases and tracks
-- Note: In a real prod environment, use a role check. Here we trust authenticated users are relevantly scoped or admins.
-- Releases Policies
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON "public"."releases";
CREATE POLICY "Enable update access for authenticated users" ON "public"."releases" AS PERMISSIVE FOR
UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON "public"."releases";
CREATE POLICY "Enable delete access for authenticated users" ON "public"."releases" AS PERMISSIVE FOR DELETE TO authenticated USING (true);
-- Tracks Policies
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON "public"."tracks";
CREATE POLICY "Enable update access for authenticated users" ON "public"."tracks" AS PERMISSIVE FOR
UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON "public"."tracks";
CREATE POLICY "Enable delete access for authenticated users" ON "public"."tracks" AS PERMISSIVE FOR DELETE TO authenticated USING (true);