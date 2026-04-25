-- Create riders table
CREATE TABLE IF NOT EXISTS riders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Add rider columns to delivery_details (safe: only if not exists)
ALTER TABLE delivery_details
  ADD COLUMN IF NOT EXISTS rider_id uuid REFERENCES riders(id),
  ADD COLUMN IF NOT EXISTS rider_name TEXT,
  ADD COLUMN IF NOT EXISTS rider_contact TEXT;

-- Create settings table for admin-controlled values
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Seed default pickup_location row
INSERT INTO settings (key, value)
VALUES ('pickup_location', '')
ON CONFLICT (key) DO NOTHING;

-- RLS: allow admin (authenticated) to read/write riders
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access riders" ON riders
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS: allow everyone to read settings, only authenticated to write
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON settings
  FOR SELECT USING (true);
CREATE POLICY "Admin write settings" ON settings
  FOR ALL USING (auth.role() = 'authenticated');
