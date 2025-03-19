-- Asegurar que previous_experience no sea NULL
UPDATE lead_details
SET previous_experience = ''
WHERE previous_experience IS NULL;

-- Asegurar que additional_comments no sea NULL
UPDATE lead_details
SET additional_comments = ''
WHERE additional_comments IS NULL;
