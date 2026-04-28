-- ================================================================
-- FIX: profiles sync with auth.users — DEFINITIVE VERSION
-- Run this entire file in Supabase SQL Editor
-- ================================================================

-- 1. ENSURE all required columns exist on profiles
-- ----------------------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role          text        DEFAULT 'customer';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified   boolean     DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone         text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address       text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_image text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at    timestamptz DEFAULT now();

-- 2. TRIGGER FUNCTION
-- Runs as postgres superuser (SECURITY DEFINER) so it bypasses RLS.
-- ON CONFLICT (id) DO NOTHING prevents duplicate rows.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer',
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop any old conflicting trigger names, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created    ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. RLS POLICIES
-- ----------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all old policies to start clean
DROP POLICY IF EXISTS "Users can view own profile"        ON profiles;
DROP POLICY IF EXISTS "Users can update own profile"      ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles"       ON profiles;
DROP POLICY IF EXISTS "Admin can update all profiles"     ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles"  ON profiles;

-- Authenticated users can read ALL profiles (needed for admin panel)
CREATE POLICY "Authenticated users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Admin can update any profile (role changes etc.)
CREATE POLICY "Admin can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (true);

-- Allow inserts from authenticated context (trigger + API fallback)
CREATE POLICY "Allow profile inserts"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 4. BACKFILL — sync any auth.users missing from profiles
-- ----------------------------------------------------------------
INSERT INTO public.profiles (id, email, full_name, role, is_verified)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  'customer',
  CASE WHEN u.email_confirmed_at IS NOT NULL THEN true ELSE false END
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- 5. NORMALIZE role values: 'user' → 'customer'
-- ----------------------------------------------------------------
UPDATE public.profiles
SET role = 'customer'
WHERE role = 'user';

-- ================================================================
-- VERIFY — run these to confirm everything is correct:
-- SELECT id, email, full_name, role, is_verified FROM profiles ORDER BY created_at DESC;
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';
-- ================================================================
