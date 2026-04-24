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

-- ORDERS
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  items jsonb not null,
  subtotal numeric not null,
  shipping numeric default 20,
  total numeric not null,
  total_amount numeric,
  full_name text,
  address text,
  contact_number text,
  delivery_date date,
  delivery_time text,
  recipient_message text,
  payment text default 'cod', -- 'cod' | 'gcash'
  receipt_url text,
  status text default 'Pending', -- Pending | Confirmed | Preparing | Out for Delivery | Delivered | Cancelled
  created_at timestamptz default now()
);

-- Run these if orders table already exists:
-- alter table orders add column if not exists total_amount numeric;
-- alter table orders add column if not exists full_name text;
-- alter table orders add column if not exists address text;
-- alter table orders add column if not exists contact_number text;
-- alter table orders add column if not exists delivery_date date;
-- alter table orders add column if not exists delivery_time text;
-- alter table orders add column if not exists recipient_message text;
-- alter table orders add column if not exists receipt_url text;

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
