-- Grant admin access to murrannomusic@gmail.com
DO $$
DECLARE target_user_id uuid;
BEGIN -- Find user ID by email
SELECT id INTO target_user_id
FROM auth.users
WHERE email = 'murrannomusic@gmail.com';
-- If user exists, update or insert user_role
IF target_user_id IS NOT NULL THEN
INSERT INTO public.user_roles (user_id, tier)
VALUES (target_user_id, 'admin') ON CONFLICT (user_id) DO
UPDATE
SET tier = 'admin';
RAISE NOTICE 'Admin role granted to %',
target_user_id;
ELSE RAISE NOTICE 'User murrannomusic@gmail.com not found';
END IF;
END $$;