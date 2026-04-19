-- Create RPC function to check admin role
CREATE OR REPLACE FUNCTION public.has_admin_role(_user_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
            AND tier = 'admin'
    );
END;
$$;