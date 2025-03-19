-- Ensure previous_experience and additional_comments are never NULL
UPDATE lead_details
SET previous_experience = ''
WHERE previous_experience IS NULL;

UPDATE lead_details
SET additional_comments = ''
WHERE additional_comments IS NULL;

-- Ensure source_channel is never NULL
UPDATE lead_details
SET source_channel = 'unknown'
WHERE source_channel IS NULL OR source_channel = '';

-- Add realtime for lead_details safely
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'lead_details'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE lead_details';
  END IF;
END;
$$;