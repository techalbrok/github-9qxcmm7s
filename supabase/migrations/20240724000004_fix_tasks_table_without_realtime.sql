-- Asegurarse de que la tabla tasks tiene los valores por defecto correctos
ALTER TABLE tasks ALTER COLUMN completed SET DEFAULT false;
ALTER TABLE tasks ALTER COLUMN created_at SET DEFAULT now();

-- Añadir restricciones NOT NULL a los campos requeridos
ALTER TABLE tasks ALTER COLUMN lead_id SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN title SET NOT NULL;
