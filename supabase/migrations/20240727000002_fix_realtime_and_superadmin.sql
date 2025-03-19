-- Fix the realtime publication error by removing the tables that are already members
-- and only adding the ones that aren't yet members

-- Create a function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION check_user_permission(permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the current user's role
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  
  -- Check permission based on role and permission name
  CASE permission_name
    -- Lead management permissions
    WHEN 'leads.create' THEN
      RETURN user_role IN ('superadmin', 'admin');
    WHEN 'leads.update' THEN
      RETURN user_role IN ('superadmin', 'admin');
    WHEN 'leads.delete' THEN
      RETURN user_role IN ('superadmin', 'admin');
    WHEN 'leads.view' THEN
      RETURN user_role IN ('superadmin', 'admin', 'user');
      
    -- Pipeline permissions
    WHEN 'pipeline.move_leads' THEN
      RETURN user_role IN ('superadmin', 'admin');
    WHEN 'pipeline.view' THEN
      RETURN user_role IN ('superadmin', 'admin', 'user');
      
    -- Task permissions
    WHEN 'tasks.create' THEN
      RETURN user_role IN ('superadmin', 'admin');
    WHEN 'tasks.update' THEN
      RETURN user_role IN ('superadmin', 'admin');
    WHEN 'tasks.delete' THEN
      RETURN user_role IN ('superadmin', 'admin');
    WHEN 'tasks.view' THEN
      RETURN user_role IN ('superadmin', 'admin', 'user');
      
    -- Communication permissions
    WHEN 'communications.create' THEN
      RETURN user_role IN ('superadmin', 'admin');
    WHEN 'communications.update' THEN
      RETURN user_role IN ('superadmin', 'admin');
    WHEN 'communications.delete' THEN
      RETURN user_role IN ('superadmin', 'admin');
    WHEN 'communications.view' THEN
      RETURN user_role IN ('superadmin', 'admin', 'user');
      
    -- User management permissions
    WHEN 'users.create' THEN
      RETURN user_role IN ('superadmin');
    WHEN 'users.update' THEN
      RETURN user_role IN ('superadmin');
    WHEN 'users.delete' THEN
      RETURN user_role IN ('superadmin');
    WHEN 'users.view' THEN
      RETURN user_role IN ('superadmin');
      
    -- Settings permissions
    WHEN 'settings.email' THEN
      RETURN user_role IN ('superadmin', 'admin');
    WHEN 'settings.view' THEN
      RETURN user_role IN ('superadmin', 'admin', 'user');
      
    -- Default case
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$;

-- Create a function to check if the current user can perform an action on a specific lead
CREATE OR REPLACE FUNCTION can_modify_lead(lead_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the current user's role
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  
  -- Superadmins and admins can modify any lead
  IF user_role IN ('superadmin', 'admin') THEN
    RETURN TRUE;
  END IF;
  
  -- Regular users cannot modify leads
  RETURN FALSE;
END;
$$;

-- Create a function to check if the current user can perform an action on a specific task
CREATE OR REPLACE FUNCTION can_modify_task(task_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the current user's role
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  
  -- Superadmins and admins can modify any task
  IF user_role IN ('superadmin', 'admin') THEN
    RETURN TRUE;
  END IF;
  
  -- Regular users cannot modify tasks
  RETURN FALSE;
END;
$$;

-- Create a function to check if the current user can perform an action on a specific communication
CREATE OR REPLACE FUNCTION can_modify_communication(communication_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
  comm_creator UUID;
BEGIN
  -- Get the current user's role
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  
  -- Superadmins and admins can modify any communication
  IF user_role IN ('superadmin', 'admin') THEN
    RETURN TRUE;
  END IF;
  
  -- Get the creator of the communication
  SELECT created_by INTO comm_creator FROM public.communications WHERE id = communication_id;
  
  -- Users can only modify their own communications
  IF user_role = 'user' AND comm_creator = auth.uid() THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Create a function to get the current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the current user's role
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  RETURN user_role;
END;
$$;

-- Only add tables to realtime that aren't already members
-- We'll check each table individually to avoid errors
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  -- Check and add lead_details if not already in publication
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'lead_details'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE lead_details';
  END IF;
  
  -- Check and add lead_status_history if not already in publication
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'lead_status_history'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE lead_status_history';
  END IF;
  
  -- Check and add tasks if not already in publication
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE tasks';
  END IF;
  
  -- Check and add communications if not already in publication
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'communications'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE communications';
  END IF;
  
  -- Check and add leads if not already in publication
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'leads'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE leads';
  END IF;
END;
$$;

-- Ensure the user tecnologia.albroksa@gmail.com is a superadmin
DO $$
DECLARE
  user_id UUID;
  user_exists BOOLEAN;
BEGIN
  -- Check if the user exists in auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'tecnologia.albroksa@gmail.com'
  ) INTO user_exists;
  
  IF user_exists THEN
    -- Get the user ID
    SELECT id INTO user_id FROM auth.users WHERE email = 'tecnologia.albroksa@gmail.com';
    
    -- Update the user's role to superadmin in public.users
    UPDATE public.users SET role = 'superadmin' WHERE id = user_id;
    
    -- If no rows were updated, the user might exist in auth but not in public.users
    IF NOT FOUND THEN
      -- Insert the user into public.users with superadmin role
      INSERT INTO public.users (id, email, role, full_name, avatar_url)
      VALUES (
        user_id, 
        'tecnologia.albroksa@gmail.com', 
        'superadmin',
        'Administrador Tecnología',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=tecnologia.albroksa@gmail.com'
      );
    END IF;
  END IF;
END;
$$;
