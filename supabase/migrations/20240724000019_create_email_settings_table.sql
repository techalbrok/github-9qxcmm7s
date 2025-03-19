-- Create email_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  smtp_host TEXT NOT NULL,
  smtp_port INTEGER NOT NULL DEFAULT 587,
  smtp_user TEXT NOT NULL,
  smtp_password TEXT NOT NULL,
  smtp_secure BOOLEAN NOT NULL DEFAULT false,
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable realtime for the table
alter publication supabase_realtime add table email_settings;