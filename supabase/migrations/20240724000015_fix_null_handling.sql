-- Ensure all lead_details records have non-null values for all fields
UPDATE lead_details
SET 
  previous_experience = COALESCE(previous_experience, ''),
  additional_comments = COALESCE(additional_comments, ''),
  investment_capacity = COALESCE(investment_capacity, 'no'),
  source_channel = COALESCE(source_channel, 'website'),
  interest_level = COALESCE(interest_level, 3),
  score = COALESCE(score, 0);

-- Add NOT NULL constraints to prevent future null values
ALTER TABLE lead_details ALTER COLUMN previous_experience SET NOT NULL;
ALTER TABLE lead_details ALTER COLUMN additional_comments SET NOT NULL;
ALTER TABLE lead_details ALTER COLUMN investment_capacity SET NOT NULL;
ALTER TABLE lead_details ALTER COLUMN source_channel SET NOT NULL;
ALTER TABLE lead_details ALTER COLUMN interest_level SET NOT NULL;
ALTER TABLE lead_details ALTER COLUMN score SET NOT NULL;
