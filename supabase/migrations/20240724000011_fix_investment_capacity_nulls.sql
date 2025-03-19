-- Asegurar que investment_capacity tenga valores válidos
UPDATE lead_details
SET investment_capacity = 'no'
WHERE investment_capacity IS NULL OR investment_capacity NOT IN ('yes', 'no');
