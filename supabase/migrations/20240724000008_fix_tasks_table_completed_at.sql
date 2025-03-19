-- Add completed_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'completed_at') THEN
    ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
END $$;
