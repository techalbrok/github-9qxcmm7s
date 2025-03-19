-- Asegurarse de que la tabla lead_details tiene los valores por defecto correctos para campos opcionales
ALTER TABLE lead_details ALTER COLUMN previous_experience SET DEFAULT '';
ALTER TABLE lead_details ALTER COLUMN additional_comments SET DEFAULT '';

-- Añadir restricciones NOT NULL a los campos requeridos
ALTER TABLE lead_details ALTER COLUMN lead_id SET NOT NULL;
ALTER TABLE lead_details ALTER COLUMN interest_level SET NOT NULL;
ALTER TABLE lead_details ALTER COLUMN investment_capacity SET NOT NULL;
ALTER TABLE lead_details ALTER COLUMN source_channel SET NOT NULL;

-- Habilitar realtime para la tabla lead_details de manera segura
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