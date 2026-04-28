-- Allow NULL for delivery_date and delivery_time
-- Required for "Delivery" method where rider handles scheduling

ALTER TABLE delivery_details
  ALTER COLUMN delivery_date DROP NOT NULL,
  ALTER COLUMN delivery_time DROP NOT NULL;

-- Optional: enforce date/time only when delivery_type = 'pickup'
ALTER TABLE delivery_details DROP CONSTRAINT IF EXISTS chk_pickup_requires_datetime;

ALTER TABLE delivery_details
  ADD CONSTRAINT chk_pickup_requires_datetime CHECK (
    delivery_type != 'pickup' OR (delivery_date IS NOT NULL AND delivery_time IS NOT NULL)
  );
