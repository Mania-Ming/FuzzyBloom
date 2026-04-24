-- =============================================
-- FIX: delivery_details RLS policies
-- Run this in your Supabase SQL Editor
-- =============================================

-- Step 1: Create delivery_details table if it doesn't exist yet
create table if not exists delivery_details (
  id            uuid default gen_random_uuid() primary key,
  order_id      uuid references orders(id) on delete cascade unique,
  full_name     text not null,
  phone         text not null,
  address       text not null,
  delivery_date date not null,
  delivery_time text not null,
  created_at    timestamptz default now()
);

-- Step 2: Enable RLS
alter table delivery_details enable row level security;

-- Step 3: Drop old/broken policies if they exist
drop policy if exists "Users can insert own delivery details"          on delivery_details;
drop policy if exists "Users can view own delivery details"            on delivery_details;
drop policy if exists "Users can insert delivery details for own orders" on delivery_details;
drop policy if exists "Users can view delivery details for own orders"   on delivery_details;

-- Step 4: INSERT policy — allow any authenticated user to insert
--   (the order_id FK already guarantees the order exists;
--    the orders INSERT policy already ensures the user owns the order)
create policy "Users can insert delivery details for own orders"
  on delivery_details
  for insert
  to authenticated
  with check (true);

-- Step 5: SELECT policy — users can only read their own delivery details
create policy "Users can view delivery details for own orders"
  on delivery_details
  for select
  to authenticated
  using (
    exists (
      select 1 from orders
      where orders.id = delivery_details.order_id
        and orders.user_id = auth.uid()
    )
  );

-- Step 6: Allow admin (service_role) full access — needed for admin panel reads
-- This is automatically granted to service_role; no extra policy needed.
-- If you use anon key on admin panel, add:
-- create policy "Admin full access" on delivery_details for all to authenticated using (true) with check (true);
