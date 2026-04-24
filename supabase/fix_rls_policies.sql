-- =============================================
-- FIX: RLS policies so orders show after checkout
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. ORDERS TABLE — ensure all required policies exist
alter table orders enable row level security;

-- Drop old policies first to avoid conflicts
drop policy if exists "Users can view own orders"    on orders;
drop policy if exists "Users can insert own orders"  on orders;
drop policy if exists "Users can update own orders"  on orders;
drop policy if exists "Admin full access orders"     on orders;

-- Users can SELECT their own orders
create policy "Users can view own orders"
  on orders for select
  to authenticated
  using (auth.uid() = user_id);

-- Users can INSERT their own orders
create policy "Users can insert own orders"
  on orders for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can UPDATE their own orders (needed for realtime sync)
create policy "Users can update own orders"
  on orders for update
  to authenticated
  using (auth.uid() = user_id);

-- 2. DELIVERY_DETAILS TABLE — ensure policies exist
alter table delivery_details enable row level security;

drop policy if exists "Users can insert delivery details for own orders" on delivery_details;
drop policy if exists "Users can view delivery details for own orders"   on delivery_details;
drop policy if exists "Admin can read all delivery details"              on delivery_details;
drop policy if exists "Admin can delete delivery details"                on delivery_details;

-- INSERT: any authenticated user can insert (FK guarantees order ownership)
create policy "Users can insert delivery details for own orders"
  on delivery_details for insert
  to authenticated
  with check (true);

-- SELECT: users can only read delivery details for their own orders
create policy "Users can view delivery details for own orders"
  on delivery_details for select
  to authenticated
  using (
    exists (
      select 1 from orders
      where orders.id = delivery_details.order_id
        and orders.user_id = auth.uid()
    )
  );

-- 3. ORDER_ITEMS TABLE — ensure users can insert and read their own
alter table order_items enable row level security;

drop policy if exists "Users can insert order items"  on order_items;
drop policy if exists "Users can view own order items" on order_items;

create policy "Users can insert order items"
  on order_items for insert
  to authenticated
  with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "Users can view own order items"
  on order_items for select
  to authenticated
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

-- 4. ORDER_STATUS_HISTORY — ensure users can read their own
alter table order_status_history enable row level security;

drop policy if exists "Users can view own order history" on order_status_history;

create policy "Users can view own order history"
  on order_status_history for select
  to authenticated
  using (
    exists (
      select 1 from orders
      where orders.id = order_status_history.order_id
        and orders.user_id = auth.uid()
    )
  );

-- 5. PROFILES — ensure users can read/update their own
alter table profiles enable row level security;

drop policy if exists "Users can view own profile"   on profiles;
drop policy if exists "Users can update own profile" on profiles;

create policy "Users can view own profile"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- 6. PRODUCTS — anyone can read
alter table products enable row level security;

drop policy if exists "Anyone can view products" on products;

create policy "Anyone can view products"
  on products for select
  using (true);
