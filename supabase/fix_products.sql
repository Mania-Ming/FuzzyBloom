-- =============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Fixes: products not showing on frontend
-- =============================================

-- 1. Add missing columns to products table
alter table products add column if not exists image_url   text;
alter table products add column if not exists is_available boolean default true;

-- 2. Copy existing img values into image_url (one-time migration)
update products set image_url = img where image_url is null and img is not null;

-- 3. Set all existing products as available if null
update products set is_available = true where is_available is null;

-- 4. Normalize category casing to lowercase (fixes case mismatch)
update products set category = lower(category) where category != lower(category);

-- 5. Fix RLS — ensure anyone (including unauthenticated) can read products
alter table products enable row level security;

drop policy if exists "Anyone can view products"        on products;
drop policy if exists "Public can view products"        on products;
drop policy if exists "Anyone can view available products" on products;

create policy "Anyone can view products"
  on products for select
  using (true);

-- 6. Verify — run this to check your data:
-- select id, name, category, is_available, image_url from products limit 20;
