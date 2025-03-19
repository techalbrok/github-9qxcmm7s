-- Ensure lead_details is properly handled when it's an array
ALTER TABLE lead_details ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY;

-- Make sure all fields have proper default values
ALTER TABLE lead_details ALTER COLUMN previous_experience SET DEFAULT '';
ALTER TABLE lead_details ALTER COLUMN additional_comments SET DEFAULT '';
ALTER TABLE lead_details ALTER COLUMN investment_capacity SET DEFAULT 'no';
ALTER TABLE lead_details ALTER COLUMN source_channel SET DEFAULT 'website';
ALTER TABLE lead_details ALTER COLUMN interest_level SET DEFAULT 3;
ALTER TABLE lead_details ALTER COLUMN score SET DEFAULT 0;
