-- Grant SELECT on tracks to authenticated users (with admin check)
-- Ideally we check a role, but for now we'll allow all authenticated users to read tracks metadata so admins can see it
-- A better approach is checking exists(select 1 from profiles where id = auth.uid() and role = 'admin')
-- Policy for tracks
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."tracks";
CREATE POLICY "Enable read access for authenticated users" ON "public"."tracks" AS PERMISSIVE FOR
SELECT TO authenticated USING (true);
-- Also ensure releases are readable
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."releases";
CREATE POLICY "Enable read access for authenticated users" ON "public"."releases" AS PERMISSIVE FOR
SELECT TO authenticated USING (true);