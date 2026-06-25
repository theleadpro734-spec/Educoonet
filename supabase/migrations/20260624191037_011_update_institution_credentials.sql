-- Update institution account credentials for easy access
-- Using DEA: LICEO2025 and Password: admin2025

UPDATE institution_accounts
SET 
  dea_code = 'LICEO2025',
  password = crypt('admin2025', gen_salt('bf'))
WHERE email = 'institucion@educonnet.com';
