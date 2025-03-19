-- Fix any remaining NULL values in lead_details
UPDATE lead_details
SET previous_experience = '' WHERE previous_experience IS NULL;

UPDATE lead_details
SET additional_comments = '' WHERE additional_comments IS NULL;

UPDATE lead_details
SET investment_capacity = 'no' WHERE investment_capacity IS NULL OR investment_capacity = '';

-- Ensure source_channel is never NULL
UPDATE lead_details
SET source_channel = 'website' WHERE source_channel IS NULL OR source_channel = '';

-- Make sure interest_level is never NULL
UPDATE lead_details
SET interest_level = 3 WHERE interest_level IS NULL;

-- Make sure score is never NULL
UPDATE lead_details
SET score = 0 WHERE score IS NULL;
