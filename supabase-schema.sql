-- =============================================
-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- =============================================

-- PROFILES (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  profile_image text,
  phone text,
  address text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- PRODUCTS
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  category text, -- 'bouquets' | 'flower-keychains' | 'ribbon-keychains' | 'headbands'
  img text,
  created_at timestamptz default now()
);

-- PRODUCT VARIANTS (colors)
create table if not exists product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  name text not null, -- e.g. 'Red', 'Blue'
  img text,
  created_at timestamptz default now()
);

-- ORDERS (core fields only)
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  items jsonb not null,
  subtotal numeric not null,
  shipping numeric default 20,
  total numeric not null,
  total_amount numeric,
  payment text default 'cod',       -- 'cod' | 'gcash'
  receipt_url text,
  status text default 'Pending',    -- Pending | Confirmed | Preparing | Out for Delivery | Delivered | Cancelled
  created_at timestamptz default now()
);

-- DELIVERY DETAILS (linked 1-to-1 with orders)
create table if not exists delivery_details (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade unique,
  full_name text not null,
  phone text not null,
  address text not null,
  delivery_date date not null,
  delivery_time text not null,
  created_at timestamptz default now()
);

alter table delivery_details enable row level security;

-- Allow authenticated users to insert delivery details for their own orders
create policy "Users can insert delivery details for own orders" on delivery_details
  for insert
  to authenticated
  with check (true);

-- Allow users to view delivery details for their own orders
create policy "Users can view delivery details for own orders" on delivery_details
  for select
  to authenticated
  using (
    exists (
      select 1 from orders 
      where orders.id = delivery_details.order_id 
      and orders.user_id = auth.uid()
    )
  );

-- Migration: if orders table already exists with old columns, run:
-- alter table orders drop column if exists full_name;
-- alter table orders drop column if exists address;
-- alter table orders drop column if exists contact_number;
-- alter table orders drop column if exists delivery_date;
-- alter table orders drop column if exists delivery_time;
-- alter table orders drop column if exists recipient_message;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;

-- Profiles: users can only read/update their own
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Products: anyone can read
create policy "Anyone can view products" on products for select using (true);

-- Orders: users can only see their own
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders" on orders for insert with check (auth.uid() = user_id);

-- ORDER STATUS HISTORY
create table if not exists order_status_history (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  status text not null,
  note text,
  changed_at timestamptz default now()
);

alter table order_status_history enable row level security;

-- Users can read history for their own orders
create policy "Users can view own order history" on order_status_history
  for select using (
    exists (
      select 1 from orders where orders.id = order_status_history.order_id and orders.user_id = auth.uid()
    )
  );

-- Trigger: auto-insert into order_status_history when order status changes
create or replace function log_order_status_change()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') or (OLD.status is distinct from NEW.status) then
    insert into order_status_history (order_id, status)
    values (NEW.id, NEW.status);
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_order_status_change on orders;
create trigger on_order_status_change
  after insert or update of status on orders
  for each row execute procedure log_order_status_change();

-- =============================================
-- STORAGE BUCKET FOR GCASH PROOFS
-- =============================================
-- Go to Supabase Dashboard > Storage > New Bucket
-- Name: proofs
-- Public: true

-- =============================================
-- SAMPLE PRODUCTS (optional - run to seed data)
-- =============================================
insert into products (name, description, price, category, img) values
('Lavender Grace', 'Soft pink pom-pom flowers, sweet & cute', 350, 'bouquets', '/p1.png'),
('Ruby & Sky', 'Red and baby blue tulips, bold but balanced', 420, 'bouquets', '/p2.png'),
('Mint Serenity', 'Mint green tulips, clean and modern look', 380, 'bouquets', '/p3.png'),
('Baby Blue Bliss', 'Sky-blue flowers, fresh and minimalist', 360, 'bouquets', '/p4.png'),
('Golden Sun', 'Yellow blossoms bright and cheerful bouquet', 400, 'bouquets', '/p5.png'),
('Flower Keychain', 'Handmade flower keychain with soft petals', 25, 'flower-keychains', '/k1.png'),
('Ribbon Keychain', 'Pearl Bow Keychain with fluffy ribbon', 20, 'ribbon-keychains', '/r1.png'),
('Headband', 'Handmade floral headband', 150, 'headbands', '/h1.png');
