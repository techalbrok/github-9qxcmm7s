-- Actualizar los valores existentes de investment_capacity
UPDATE lead_details
SET investment_capacity = CASE
    WHEN investment_capacity = 'high' THEN 'yes'
    WHEN investment_capacity = 'medium' THEN 'yes'
    WHEN investment_capacity = 'low' THEN 'no'
    ELSE 'no'
    END;
