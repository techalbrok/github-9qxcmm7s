-- Create franchises table
CREATE TABLE IF NOT EXISTS franchises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  tesis_code TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view all franchises" ON franchises;
CREATE POLICY "Users can view all franchises"
  ON franchises FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert franchises" ON franchises;
CREATE POLICY "Admins can insert franchises"
  ON franchises FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "Admins can update franchises" ON franchises;
CREATE POLICY "Admins can update franchises"
  ON franchises FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "Admins can delete franchises" ON franchises;
CREATE POLICY "Admins can delete franchises"
  ON franchises FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));

-- Enable realtime
alter publication supabase_realtime add table franchises;
