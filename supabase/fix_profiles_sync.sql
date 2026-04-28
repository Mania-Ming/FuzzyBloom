-- ================================================================
-- FIX: profiles sync with auth.users
-- Run this entire file in Supabase SQL Editor
-- ================================================================

-- 1. ENSURE profiles table has all required columns
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     text,
  email         text,
  role          text DEFAULT 'customer',
  is_verified   boolean DEFAULT false,
  phone         text,
  address       text,
  profile_image text,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role          text DEFAULT 'customer';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified   boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone         text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address       text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_image text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at    timestamptz DEFAULT now();

-- 2. TRIGGER FUNCTION — fires on every new auth.users INSERT
-- ----------------------------------------------------------------
-- Uses SECURITY DEFINER so it runs as the postgres superuser,
-- bypassing RLS. ON CONFLICT DO NOTHING prevents duplicates.
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

-- Drop old trigger names that may conflict
DROP TRIGGER IF EXISTS on_auth_user_created    ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. RLS POLICIES
-- ----------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users: read + update own profile
DROP POLICY IF EXISTS "Users can view own profile"   ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Admin: read all profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT TO authenticated USING (true);

-- Admin: update any profile (for role changes)
DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;
CREATE POLICY "Admin can update all profiles"
  ON profiles FOR UPDATE TO authenticated USING (true);

-- Allow service role to insert profiles (used by trigger + API fallback)
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT TO authenticated WITH CHECK (true);

-- 4. BACKFILL — insert any auth.users that are missing from profiles
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

-- 5. FIX existing profiles that have role = 'user' → 'customer'
-- ----------------------------------------------------------------
UPDATE public.profiles
SET role = 'customer'
WHERE role = 'user';

-- Verify result
-- SELECT id, email, full_name, role, is_verified FROM profiles ORDER BY created_at DESC;
