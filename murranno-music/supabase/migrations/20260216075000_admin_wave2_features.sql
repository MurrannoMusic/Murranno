-- Support Tickets System
CREATE TABLE IF NOT EXISTS "public"."support_tickets" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "user_id" uuid REFERENCES "auth"."users"("id") DEFAULT auth.uid(),
    "subject" text NOT NULL,
    "message" text NOT NULL,
    "category" text NOT NULL,
    -- technical, billing, etc.
    "status" text DEFAULT 'open' NOT NULL,
    -- open, in_progress, resolved, closed
    "admin_notes" text,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE "public"."support_tickets" ENABLE ROW LEVEL SECURITY;
-- 1. Users can INSERT their own tickets
CREATE POLICY "Users can create tickets" ON "public"."support_tickets" AS PERMISSIVE FOR
INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- 2. Users can VIEW their own tickets
CREATE POLICY "Users can view own tickets" ON "public"."support_tickets" AS PERMISSIVE FOR
SELECT TO authenticated USING (auth.uid() = user_id);
-- 3. Admins can VIEW all tickets (assuming authenticated for now, ideally restrict to admin)
-- We'll use a broad policy for Authenticated to View All, but front-end will filter.
-- Ideally we'd use a role check. For now, let's allow authenticated to SELECT (so admins can see).
-- Wait, we don't want regular users seeing others' tickets.
-- So for Admins, we need a way to bypass RLS or have a specific policy.
-- Since we are using Supabase Client on frontend with Anon key, RLS applies.
-- We can add a policy for specific emails or if we have an `is_admin` function.
-- Let's stick to the current pattern: "authenticated users can update" (which is how we did the other admin stuff).
-- LIMITATION: This means regular users *could* technically fetch other tickets if they guessed IDs.
-- BETTER: Use a policy based on `user_roles` table if possible, or just accept the risk for this prototype phase.
-- I'll add a policy that allows viewing if you are the owner OR if you have an admin role (via join, if complex).
-- SIMPLEST SECURE WAY: Create a view or function for admins, OR just rely on "service_role" for admin dashboard?
-- NO, Admin dashboard uses same client.
-- Let's try to do a proper policy using `exists`.
CREATE POLICY "Admins can view all tickets" ON "public"."support_tickets" AS PERMISSIVE FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM user_roles ur
            WHERE ur.user_id = auth.uid()
                AND ur.tier = 'admin'
        )
    );
CREATE POLICY "Admins can update tickets" ON "public"."support_tickets" AS PERMISSIVE FOR
UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM user_roles ur
            WHERE ur.user_id = auth.uid()
                AND ur.tier = 'admin'
        )
    ) WITH CHECK (true);