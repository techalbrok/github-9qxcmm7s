-- Asegurarse de que la tabla tasks tiene los campos necesarios
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS type VARCHAR;

-- Asegurarse de que la tabla tasks tiene los valores por defecto correctos
ALTER TABLE tasks ALTER COLUMN completed SET DEFAULT false;

-- Añadir restricciones NOT NULL a los campos requeridos si no existen
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE tasks ALTER COLUMN lead_id SET NOT NULL;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER TABLE tasks ALTER COLUMN title SET NOT NULL;
  EXCEPTION WHEN others THEN
    NULL;
  END;
END $$;
