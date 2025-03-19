-- Asegurarse de que la tabla lead_details tiene los valores por defecto correctos para campos opcionales
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE lead_details ALTER COLUMN previous_experience SET DEFAULT '';
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER TABLE lead_details ALTER COLUMN additional_comments SET DEFAULT '';
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER TABLE lead_details ALTER COLUMN lead_id SET NOT NULL;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER TABLE lead_details ALTER COLUMN interest_level SET NOT NULL;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER TABLE lead_details ALTER COLUMN investment_capacity SET NOT NULL;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER TABLE lead_details ALTER COLUMN source_channel SET NOT NULL;
  EXCEPTION WHEN others THEN
    NULL;
  END;
END $$;
