-- Add delivery_type column to delivery_details table
ALTER TABLE delivery_details
  ADD COLUMN IF NOT EXISTS delivery_type TEXT NOT NULL DEFAULT 'delivery';

-- Optional: add a check constraint to restrict to known values
ALTER TABLE delivery_details
  DROP CONSTRAINT IF EXISTS delivery_details_delivery_type_check;

ALTER TABLE delivery_details
  ADD CONSTRAINT delivery_details_delivery_type_check
  CHECK (delivery_type IN ('delivery', 'pickup', 'meetup'));
