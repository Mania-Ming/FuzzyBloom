-- Add rider assignment columns to delivery_details
ALTER TABLE delivery_details
  ADD COLUMN IF NOT EXISTS rider_name TEXT,
  ADD COLUMN IF NOT EXISTS rider_contact TEXT;
