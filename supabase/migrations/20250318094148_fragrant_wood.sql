-- Asegurarse de que la tabla tasks tiene los valores por defecto correctos
ALTER TABLE tasks ALTER COLUMN completed SET DEFAULT false;
ALTER TABLE tasks ALTER COLUMN created_at SET DEFAULT now();

-- Añadir restricciones NOT NULL a los campos requeridos
ALTER TABLE tasks ALTER COLUMN lead_id SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN title SET NOT NULL;

-- Habilitar realtime para la tabla tasks de manera segura
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE tasks';
  END IF;
END;
$$;