/*
# Create test institution account for Liceo Romero Garcia

## Purpose
Create a dedicated test auth user for the Liceo Romero Garcia institution
with email liceo.romero.garcia@educonnet.com and known password.
Transfer the institution ownership to this new user.
*/

-- Insert the new auth user with bcrypt-encrypted password
-- Password: RomeroGarcia2026
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  email_confirmed_at,
  encrypted_password,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  email_change_token_current,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'liceo.romero.garcia@educonnet.com',
  now(),
  crypt('RomeroGarcia2026', gen_salt('bf')),
  jsonb_build_object('role', 'institution', 'provider', 'email', 'providers', jsonb_build_array('email')),
  jsonb_build_object('role', 'institution', 'email', 'liceo.romero.garcia@educonnet.com', 'full_name', 'Liceo Romero Garcia', 'email_verified', true),
  now(),
  now(),
  '',
  '',
  '',
  '',
  ''
)
RETURNING id;
