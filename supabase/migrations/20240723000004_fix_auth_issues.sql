-- Asegurarse de que la tabla de usuarios tiene las políticas correctas
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Asegurarse de que RLS está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Crear una política para permitir acceso anónimo a la tabla users (solo para depuración)
DROP POLICY IF EXISTS "Allow anonymous access" ON public.users;
CREATE POLICY "Allow anonymous access" ON public.users
  FOR SELECT
  TO anon
  USING (true);
