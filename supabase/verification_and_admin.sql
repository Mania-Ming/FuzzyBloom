-- =============================================
-- VERIFICATION CODES TABLE
-- Run this in Supabase SQL Editor
-- =============================================

create table if not exists verification_codes (
  id         uuid default gen_random_uuid() primary key,
  email      text not null,
  code       text not null,
  expires_at timestamptz not null,
  used       boolean default false,
  created_at timestamptz default now()
);

-- Index for fast lookup by email
create index if not exists idx_verification_codes_email on verification_codes(email);

-- RLS
alter table verification_codes enable row level security;

-- Only the service role (your backend) can insert/read/delete — no client access
-- (Your API route uses the service role key, so no policy needed for anon/authenticated)

-- =============================================
-- HELPER: Clean up expired codes automatically
-- =============================================
create or replace function delete_expired_verification_codes()
returns void as $$
begin
  delete from verification_codes where expires_at < now();
end;
$$ language plpgsql security definer;

-- =============================================
-- ADMIN: Full access to all tables
-- Run this if your admin panel uses anon key
-- =============================================

-- Orders
drop policy if exists "Admin full access orders" on orders;
create policy "Admin full access orders"
  on orders for all
  to authenticated
  using (true)
  with check (true);

-- Delivery Details
drop policy if exists "Admin can read all delivery details" on delivery_details;
create policy "Admin can read all delivery details"
  on delivery_details for select
  to authenticated
  using (true);

drop policy if exists "Admin can delete delivery details" on delivery_details;
create policy "Admin can delete delivery details"
  on delivery_details for delete
  to authenticated
  using (true);

-- Profiles
drop policy if exists "Admin can view all profiles" on profiles;
create policy "Admin can view all profiles"
  on profiles for select
  to authenticated
  using (true);

-- Products: admin can insert/update/delete
drop policy if exists "Admin can manage products" on products;
create policy "Admin can manage products"
  on products for all
  to authenticated
  using (true)
  with check (true);

-- =============================================
-- USEFUL QUERIES FOR SUPABASE SQL EDITOR
-- =============================================

-- View all orders with delivery details
-- select o.id, o.status, o.total, o.created_at, d.full_name, d.phone, d.address, d.delivery_date
-- from orders o
-- left join delivery_details d on d.order_id = o.id
-- order by o.created_at desc;

-- View all users/profiles
-- select * from profiles order by created_at desc;

-- View pending verification codes (not expired, not used)
-- select email, code, expires_at from verification_codes
-- where used = false and expires_at > now()
-- order by created_at desc;

-- Manually clean expired codes
-- select delete_expired_verification_codes();

-- View order status history
-- select o.id, p.full_name, h.status, h.changed_at
-- from order_status_history h
-- join orders o on o.id = h.order_id
-- join profiles p on p.id = o.user_id
-- order by h.changed_at desc;
