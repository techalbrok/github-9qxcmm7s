-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lead details table
CREATE TABLE IF NOT EXISTS lead_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  previous_experience TEXT,
  investment_capacity TEXT NOT NULL,
  source_channel TEXT NOT NULL,
  interest_level INTEGER NOT NULL CHECK (interest_level BETWEEN 1 AND 5),
  additional_comments TEXT,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lead status history table
CREATE TABLE IF NOT EXISTS lead_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communications table
CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table to mirror auth.users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for tables safely
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  -- Check and add leads if not in publication
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'leads'
  ) INTO table_exists;
  IF NOT table_exists THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE leads';
  END IF;

  -- Check and add lead_details if not in publication
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'lead_details'
  ) INTO table_exists;
  IF NOT table_exists THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE lead_details';
  END IF;

  -- Check and add lead_status_history if not in publication
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'lead_status_history'
  ) INTO table_exists;
  IF NOT table_exists THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE lead_status_history';
  END IF;

  -- Check and add communications if not in publication
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'communications'
  ) INTO table_exists;
  IF NOT table_exists THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE communications';
  END IF;

  -- Check and add tasks if not in publication
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
  ) INTO table_exists;
  IF NOT table_exists THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE tasks';
  END IF;

  -- Check and add users if not in publication
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'users'
  ) INTO table_exists;
  IF NOT table_exists THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE users';
  END IF;
END;
$$;