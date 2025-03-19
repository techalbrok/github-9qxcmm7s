-- Add default users with specific roles

-- Create Alba Heras (admin)
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'aheras@albroksa.com',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Alba Heras"}'
)
ON CONFLICT (email) DO NOTHING;

-- Get the ID of Alba Heras
DO $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = 'aheras@albroksa.com';
  
  -- Set password for Alba Heras
  UPDATE auth.users
  SET encrypted_password = crypt('00000000', gen_salt('bf'))
  WHERE id = user_id;
  
  -- Insert into public.users table with admin role
  INSERT INTO public.users (id, email, full_name, role, avatar_url, created_at)
  VALUES (
    user_id,
    'aheras@albroksa.com',
    'Alba Heras',
    'admin',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=aheras@albroksa.com',
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    full_name = 'Alba Heras',
    updated_at = now();
END
$$;

-- Create Marcos Chaves (admin)
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'mchaves@albroksa.com',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Marcos Chaves"}'
)
ON CONFLICT (email) DO NOTHING;

-- Get the ID of Marcos Chaves
DO $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = 'mchaves@albroksa.com';
  
  -- Set password for Marcos Chaves
  UPDATE auth.users
  SET encrypted_password = crypt('00000000', gen_salt('bf'))
  WHERE id = user_id;
  
  -- Insert into public.users table with admin role
  INSERT INTO public.users (id, email, full_name, role, avatar_url, created_at)
  VALUES (
    user_id,
    'mchaves@albroksa.com',
    'Marcos Chaves',
    'admin',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=mchaves@albroksa.com',
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    full_name = 'Marcos Chaves',
    updated_at = now();
END
$$;

-- Create Ángel Mirat (user)
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'amirat@albroksa.com',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Ángel Mirat"}'
)
ON CONFLICT (email) DO NOTHING;

-- Get the ID of Ángel Mirat
DO $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = 'amirat@albroksa.com';
  
  -- Set password for Ángel Mirat
  UPDATE auth.users
  SET encrypted_password = crypt('00000000', gen_salt('bf'))
  WHERE id = user_id;
  
  -- Insert into public.users table with user role
  INSERT INTO public.users (id, email, full_name, role, avatar_url, created_at)
  VALUES (
    user_id,
    'amirat@albroksa.com',
    'Ángel Mirat',
    'user',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=amirat@albroksa.com',
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'user',
    full_name = 'Ángel Mirat',
    updated_at = now();
END
$$;