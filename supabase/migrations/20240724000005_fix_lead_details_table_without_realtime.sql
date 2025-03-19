-- Asegurarse de que la tabla lead_details tiene los valores por defecto correctos para campos opcionales
ALTER TABLE lead_details ALTER COLUMN previous_experience SET DEFAULT '';
ALTER TABLE lead_details ALTER COLUMN additional_comments SET DEFAULT '';

-- Añadir restricciones NOT NULL a los campos requeridos
ALTER TABLE lead_details ALTER COLUMN lead_id SET NOT NULL;
ALTER TABLE lead_details ALTER COLUMN interest_level SET NOT NULL;
ALTER TABLE lead_details ALTER COLUMN investment_capacity SET NOT NULL;
ALTER TABLE lead_details ALTER COLUMN source_channel SET NOT NULL;
