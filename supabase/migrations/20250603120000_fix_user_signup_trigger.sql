-- KrushiLink: fix "Database error saving new user" on sign-up
-- Run in Supabase Dashboard → SQL Editor

-- 1. Remove broken auth signup triggers (they block ALL sign-ups when misconfigured)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT t.tgname
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'auth'
      AND c.relname = 'users'
      AND NOT t.tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', r.tgname);
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Role enum
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('farmer', 'retailer', 'admin', 'logistics');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Profile table (matches src/lib/types)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'farmer',
  full_name text NOT NULL DEFAULT '',
  phone text,
  district text,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add columns if an older schema already exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role public.user_role NOT NULL DEFAULT 'farmer';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name text NOT NULL DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- 4. RLS — app creates profiles via service role API or signed-in user insert
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role (used by /api/auth/register) bypasses RLS automatically.
