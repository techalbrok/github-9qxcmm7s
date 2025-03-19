-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lead_details table
CREATE TABLE IF NOT EXISTS public.lead_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  previous_experience TEXT DEFAULT '',
  investment_capacity TEXT DEFAULT 'no',
  source_channel TEXT DEFAULT 'website',
  interest_level INTEGER DEFAULT 3,
  additional_comments TEXT DEFAULT '',
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lead_status_history table
CREATE TABLE IF NOT EXISTS public.lead_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'new_contact',
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  type TEXT DEFAULT 'call',
  assigned_to UUID REFERENCES public.users(id),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communications table
CREATE TABLE IF NOT EXISTS public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create franchises table
CREATE TABLE IF NOT EXISTS public.franchises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  tesis_code TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_settings table
CREATE TABLE IF NOT EXISTS public.email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_user TEXT,
  smtp_password TEXT,
  smtp_secure BOOLEAN DEFAULT TRUE,
  from_email TEXT,
  from_name TEXT,
  mailrelay_api_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users table policies
DROP POLICY IF EXISTS "Users can view their own user data" ON public.users;
CREATE POLICY "Users can view their own user data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
  ));

DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
CREATE POLICY "Admins can insert users"
  ON public.users FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
  ));

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any user" ON public.users;
CREATE POLICY "Admins can update any user"
  ON public.users FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
  ));

DROP POLICY IF EXISTS "Superadmins can delete users" ON public.users;
CREATE POLICY "Superadmins can delete users"
  ON public.users FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- Leads table policies
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
CREATE POLICY "Authenticated users can view leads"
  ON public.leads FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can insert leads" ON public.leads;
CREATE POLICY "Admins can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
  ));

DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
CREATE POLICY "Admins can update leads"
  ON public.leads FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
  ));

DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
CREATE POLICY "Admins can delete leads"
  ON public.leads FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
  ));

-- Create function to get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_role TEXT;
BEGIN
  SELECT role INTO current_role FROM public.users WHERE id = auth.uid();
  RETURN current_role;
END;
$$;

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_details;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_status_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.communications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.franchises;
