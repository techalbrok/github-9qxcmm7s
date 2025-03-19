-- Create the superadmin user if it doesn't exist
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'tecnologia.albroksa@gmail.com',
  crypt('Jbfjbf1982@#', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Superadministrador"}'
)
ON CONFLICT (email) DO NOTHING;

-- Get the user ID for the superadmin
DO $$
DECLARE
  superadmin_id UUID;
BEGIN
  SELECT id INTO superadmin_id FROM auth.users WHERE email = 'tecnologia.albroksa@gmail.com';
  
  -- Insert into public.users with superadmin role
  INSERT INTO public.users (id, email, full_name, role, avatar_url, created_at, updated_at)
  VALUES (
    superadmin_id,
    'tecnologia.albroksa@gmail.com',
    'Superadministrador',
    'superadmin',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=tecnologia.albroksa@gmail.com',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'superadmin',
    full_name = 'Superadministrador',
    updated_at = now();
END;
$$;