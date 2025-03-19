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

-- Enable realtime for the tables
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table leads;
alter publication supabase_realtime add table lead_details;
alter publication supabase_realtime add table lead_status_history;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table communications;
