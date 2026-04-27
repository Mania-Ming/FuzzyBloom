-- =============================================
-- MASTER FIX — Run this in Supabase SQL Editor
-- Fixes: trigger conflict, FK constraint, is_verified
-- =============================================

-- 1. FIX PROFILES TABLE — ensure all columns exist
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  email         text,
  phone         text,
  address       text,
  role          text default 'user',
  profile_image text,
  is_verified   boolean default false,
  created_at    timestamptz default now()
);

alter table profiles add column if not exists is_verified boolean default false;
alter table profiles add column if not exists role text default 'user';
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists address text;
alter table profiles add column if not exists profile_image text;

-- 2. FIX TRIGGER — use security definer, handle conflict safely
create or replace function create_profile_for_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, is_verified)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'user',
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure create_profile_for_user();

-- 3. RLS POLICIES FOR PROFILES
alter table profiles enable row level security;

drop policy if exists "Users can view own profile"   on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Admin can view all profiles"  on profiles;

create policy "Users can view own profile"
  on profiles for select to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update to authenticated
  using (auth.uid() = id);

create policy "Admin can view all profiles"
  on profiles for select to authenticated
  using (true);

-- 4. FIX VERIFICATION_CODES TABLE
-- Drop user_id FK constraint so OTP can be saved before user is confirmed
drop table if exists verification_codes;

create table verification_codes (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid,                          -- no FK, intentional
  email      text not null,
  code       text not null,
  expires_at timestamptz not null,
  used       boolean default false,
  created_at timestamptz default now()
);

create index idx_verification_codes_email   on verification_codes(email);
create index idx_verification_codes_user_id on verification_codes(user_id);

-- RLS: service role only (API routes use service role key — bypasses RLS)
alter table verification_codes enable row level security;

-- 5. BACKFILL profiles for existing auth users
insert into profiles (id, email, full_name, role, is_verified)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  'user',
  false
from auth.users u
where not exists (select 1 from profiles p where p.id = u.id);
