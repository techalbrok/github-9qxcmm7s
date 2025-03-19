-- Add email column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email') THEN
        ALTER TABLE public.users ADD COLUMN email TEXT;
    END IF;
END
$$;

-- Update email values from auth.users if they are null
UPDATE public.users
SET email = auth.users.email
FROM auth.users
WHERE public.users.id = auth.users.id AND public.users.email IS NULL;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ;
    END IF;
END
$$;

-- Set default value for updated_at if it's null
UPDATE public.users
SET updated_at = NOW()
WHERE updated_at IS NULL;

-- Add NOT NULL constraint to email column
ALTER TABLE public.users ALTER COLUMN email SET NOT NULL;

-- Add unique constraint to email
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key'
    ) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
    END IF;
END
$$;

-- Add function to check user permissions
CREATE OR REPLACE FUNCTION public.check_user_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  
  -- Superadmin has all permissions
  IF user_role = 'superadmin' THEN
    RETURN TRUE;
  END IF;
  
  -- Admin has most permissions except user management
  IF user_role = 'admin' AND permission_name != 'manage_users' THEN
    RETURN TRUE;
  END IF;
  
  -- User has limited permissions
  IF user_role = 'user' AND permission_name IN ('view_leads', 'view_tasks') THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add functions to check if user can modify specific resources
CREATE OR REPLACE FUNCTION public.can_modify_lead(lead_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  
  -- Superadmin and admin can modify any lead
  IF user_role IN ('superadmin', 'admin') THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_modify_task(task_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  task_owner UUID;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  
  -- Superadmin and admin can modify any task
  IF user_role IN ('superadmin', 'admin') THEN
    RETURN TRUE;
  END IF;
  
  -- Users can only modify tasks assigned to them
  SELECT assigned_to INTO task_owner FROM public.tasks WHERE id = task_id;
  IF task_owner = auth.uid() THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_modify_communication(communication_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  comm_creator UUID;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  
  -- Superadmin and admin can modify any communication
  IF user_role IN ('superadmin', 'admin') THEN
    RETURN TRUE;
  END IF;
  
  -- Users can only modify communications they created
  SELECT created_by INTO comm_creator FROM public.communications WHERE id = communication_id;
  IF comm_creator = auth.uid() THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add realtime publication for users table if not already added
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'users'
    ) THEN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.users';
    END IF;
END
$$;