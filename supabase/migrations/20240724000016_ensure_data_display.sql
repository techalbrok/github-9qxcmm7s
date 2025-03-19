-- Ensure all lead_details fields have proper default values
ALTER TABLE lead_details ALTER COLUMN previous_experience SET DEFAULT '';
ALTER TABLE lead_details ALTER COLUMN additional_comments SET DEFAULT '';
ALTER TABLE lead_details ALTER COLUMN investment_capacity SET DEFAULT 'no';
ALTER TABLE lead_details ALTER COLUMN source_channel SET DEFAULT 'website';
ALTER TABLE lead_details ALTER COLUMN interest_level SET DEFAULT 3;
ALTER TABLE lead_details ALTER COLUMN score SET DEFAULT 0;

-- Update any existing null values
UPDATE lead_details SET previous_experience = '' WHERE previous_experience IS NULL;
UPDATE lead_details SET additional_comments = '' WHERE additional_comments IS NULL;
UPDATE lead_details SET investment_capacity = 'no' WHERE investment_capacity IS NULL OR investment_capacity = '';
UPDATE lead_details SET source_channel = 'website' WHERE source_channel IS NULL OR source_channel = '';
UPDATE lead_details SET interest_level = 3 WHERE interest_level IS NULL;
UPDATE lead_details SET score = 0 WHERE score IS NULL;

-- Add NOT NULL constraints to ensure data integrity
ALTER TABLE lead_details ALTER COLUMN previous_experience SET NOT NULL;
ALTER TABLE lead_details ALTER COLUMN additional_comments SET NOT NULL;
ALTER TABLE lead_details ALTER COLUMN investment_capacity SET NOT NULL;
ALTER TABLE lead_details ALTER COLUMN source_channel SET NOT NULL;
ALTER TABLE lead_details ALTER COLUMN interest_level SET NOT NULL;
ALTER TABLE lead_details ALTER COLUMN score SET NOT NULL;

-- Enable realtime for lead_details table
alter publication supabase_realtime add table lead_details;