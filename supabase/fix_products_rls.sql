-- =============================================
-- FIX: Products RLS — add missing UPDATE + DELETE policies
-- Run this in Supabase SQL Editor
-- =============================================

-- Allow authenticated users (admin) to update products
DROP POLICY IF EXISTS "Admin can update products" ON products;
CREATE POLICY "Admin can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admin) to delete products
DROP POLICY IF EXISTS "Admin can delete products" ON products;
CREATE POLICY "Admin can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Allow authenticated users (admin) to insert products
DROP POLICY IF EXISTS "Admin can insert products" ON products;
CREATE POLICY "Admin can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Verify policies are in place
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'products';
