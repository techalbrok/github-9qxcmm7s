-- Add role-based access control functions

-- Function to check if a user has a specific role
CREATE OR REPLACE FUNCTION public.user_has_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = user_id;
  
  -- Superadmin has access to everything
  IF user_role = 'superadmin' THEN
    RETURN TRUE;
  END IF;
  
  -- Admin has access to admin and user roles
  IF user_role = 'admin' AND required_role IN ('admin', 'user') THEN
    RETURN TRUE;
  END IF;
  
  -- User only has access to user role
  IF user_role = 'user' AND required_role = 'user' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for leads table based on roles
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Superadmin and admin can do everything
CREATE POLICY "Superadmin and admin full access" ON public.leads
  USING (public.user_has_role(auth.uid(), 'admin'));

-- Regular users can only view
CREATE POLICY "Users can only view" ON public.leads
  FOR SELECT
  USING (public.user_has_role(auth.uid(), 'user'));

-- Similar policies for lead_details
ALTER TABLE public.lead_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin and admin full access" ON public.lead_details
  USING (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can only view" ON public.lead_details
  FOR SELECT
  USING (public.user_has_role(auth.uid(), 'user'));

-- Similar policies for lead_status_history
ALTER TABLE public.lead_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin and admin full access" ON public.lead_status_history
  USING (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can only view" ON public.lead_status_history
  FOR SELECT
  USING (public.user_has_role(auth.uid(), 'user'));

-- Similar policies for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin and admin full access" ON public.tasks
  USING (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can only view" ON public.tasks
  FOR SELECT
  USING (public.user_has_role(auth.uid(), 'user'));

-- Similar policies for communications
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin and admin full access" ON public.communications
  USING (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can only view" ON public.communications
  FOR SELECT
  USING (public.user_has_role(auth.uid(), 'user'));

-- Users table policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Everyone can view users
CREATE POLICY "Everyone can view users" ON public.users
  FOR SELECT
  USING (true);

-- Only superadmin can modify users
CREATE POLICY "Only superadmin can modify users" ON public.users
  USING (public.get_current_user_role() = 'superadmin');

-- Email settings policies
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- Only superadmin and admin can manage email settings
CREATE POLICY "Superadmin and admin can manage email settings" ON public.email_settings
  USING (public.user_has_role(auth.uid(), 'admin'));

-- Users can view email settings
CREATE POLICY "Users can view email settings" ON public.email_settings
  FOR SELECT
  USING (public.user_has_role(auth.uid(), 'user'));