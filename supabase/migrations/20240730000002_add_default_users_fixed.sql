-- Add default users with specific roles

-- Create Alba Heras (admin)
DO $$
DECLARE
  user_id UUID := gen_random_uuid();
BEGIN
  -- Check if user already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'aheras@albroksa.com') THEN
    -- Insert into auth.users
    INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      user_id,
      'aheras@albroksa.com',
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Alba Heras"}'
    );
    
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
    );
  END IF;
END
$$;

-- Create Marcos Chaves (admin)
DO $$
DECLARE
  user_id UUID := gen_random_uuid();
BEGIN
  -- Check if user already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mchaves@albroksa.com') THEN
    -- Insert into auth.users
    INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      user_id,
      'mchaves@albroksa.com',
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Marcos Chaves"}'
    );
    
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
    );
  END IF;
END
$$;

-- Create Ángel Mirat (user)
DO $$
DECLARE
  user_id UUID := gen_random_uuid();
BEGIN
  -- Check if user already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'amirat@albroksa.com') THEN
    -- Insert into auth.users
    INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      user_id,
      'amirat@albroksa.com',
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Ángel Mirat"}'
    );
    
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
    );
  END IF;
END
$$;