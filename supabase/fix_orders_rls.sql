-- ================================================================
-- FIX: orders + related tables RLS policies
-- Run this entire file in Supabase SQL Editor
-- ================================================================

-- 1. ORDERS TABLE
-- ----------------------------------------------------------------
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop all old conflicting policies
DROP POLICY IF EXISTS "Users can view own orders"    ON orders;
DROP POLICY IF EXISTS "Users can insert own orders"  ON orders;
DROP POLICY IF EXISTS "Users can update own orders"  ON orders;
DROP POLICY IF EXISTS "Admin full access orders"     ON orders;
DROP POLICY IF EXISTS "Users can create orders"      ON orders;
DROP POLICY IF EXISTS "Admins full access orders"    ON orders;

-- Users can insert their own orders (user_id must match logged-in user)
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own orders (e.g. cancel)
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin full access (covers all operations for admin panel)
CREATE POLICY "Admin full access orders"
  ON orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. DELIVERY_DETAILS TABLE
-- ----------------------------------------------------------------
ALTER TABLE delivery_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert delivery details for own orders" ON delivery_details;
DROP POLICY IF EXISTS "Users can view delivery details for own orders"   ON delivery_details;
DROP POLICY IF EXISTS "Admin can read all delivery details"              ON delivery_details;
DROP POLICY IF EXISTS "Admin can delete delivery details"                ON delivery_details;
DROP POLICY IF EXISTS "Admin full access delivery_details"               ON delivery_details;

-- Users can insert delivery details for their own orders
CREATE POLICY "Users can insert delivery details"
  ON delivery_details FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = delivery_details.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can read delivery details for their own orders
CREATE POLICY "Users can view own delivery details"
  ON delivery_details FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = delivery_details.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admin full access
CREATE POLICY "Admin full access delivery_details"
  ON delivery_details FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. ORDER_ITEMS TABLE
-- ----------------------------------------------------------------
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
DROP POLICY IF EXISTS "Users can view own order items"   ON order_items;
DROP POLICY IF EXISTS "Admin full access order_items"    ON order_items;

-- Users can insert items for their own orders
CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can read items for their own orders
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admin full access
CREATE POLICY "Admin full access order_items"
  ON order_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. ORDER_STATUS_HISTORY TABLE
-- ----------------------------------------------------------------
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order history" ON order_status_history;
DROP POLICY IF EXISTS "Admin full access order_status_history" ON order_status_history;

CREATE POLICY "Users can view own order history"
  ON order_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin full access order_status_history"
  ON order_status_history FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ================================================================
-- VERIFY — run these after applying:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'orders';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'delivery_details';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'order_items';
-- ================================================================
