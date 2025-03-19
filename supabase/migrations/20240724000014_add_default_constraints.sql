-- Add default constraints to lead_details table to prevent NULL values
ALTER TABLE lead_details ALTER COLUMN previous_experience SET DEFAULT '';
ALTER TABLE lead_details ALTER COLUMN additional_comments SET DEFAULT '';
ALTER TABLE lead_details ALTER COLUMN investment_capacity SET DEFAULT 'no';
ALTER TABLE lead_details ALTER COLUMN source_channel SET DEFAULT 'website';
ALTER TABLE lead_details ALTER COLUMN interest_level SET DEFAULT 3;
ALTER TABLE lead_details ALTER COLUMN score SET DEFAULT 0;
