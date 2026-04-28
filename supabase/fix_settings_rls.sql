-- ================================================================
-- FIX: settings table RLS + unique constraint
-- Run this in Supabase SQL Editor
-- ================================================================

-- 1. UNIQUE constraint on key (required for upsert onConflict: "key")
-- ----------------------------------------------------------------
ALTER TABLE settings ADD COLUMN IF NOT EXISTS key   text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS value text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'settings_key_unique' AND conrelid = 'settings'::regclass
  ) THEN
    ALTER TABLE settings ADD CONSTRAINT settings_key_unique UNIQUE (key);
  END IF;
END $$;

-- 2. RLS — enable and set policies
-- ----------------------------------------------------------------
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read settings"        ON settings;
DROP POLICY IF EXISTS "Admin write settings"        ON settings;
DROP POLICY IF EXISTS "Authenticated read settings" ON settings;
DROP POLICY IF EXISTS "Authenticated write settings" ON settings;

-- Anyone can read settings (pickup location shown to customers at checkout)
CREATE POLICY "Public read settings"
  ON settings FOR SELECT
  USING (true);

-- Only authenticated users (admins) can insert/update/delete
CREATE POLICY "Authenticated write settings"
  ON settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ================================================================
-- VERIFY
-- SELECT * FROM settings;
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'settings';
-- ================================================================
