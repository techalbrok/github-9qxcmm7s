-- Asegurarse de que la tabla de usuarios existe y tiene la configuración correcta
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Asegurarse de que las políticas de seguridad permiten el acceso adecuado
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Habilitar RLS en la tabla de usuarios
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Crear un trigger para insertar automáticamente un registro en public.users cuando se crea un usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar el trigger si ya existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
