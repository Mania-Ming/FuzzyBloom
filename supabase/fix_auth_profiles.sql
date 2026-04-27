-- =============================================
-- FIX: Complete Auth System (Profiles + RLS + Trigger)
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. PROFILES TABLE
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text,
  phone      text,
  address    text,
  role       text default 'user',
  profile_image text,
  created_at timestamptz default now()
);

-- 2. RLS
alter table profiles enable row level security;

drop policy if exists "Allow insert profile"        on profiles;
drop policy if exists "Users can view own profile"  on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Admin can view all profiles" on profiles;

-- Trigger inserts the profile (service role), so no INSERT policy needed for users
create policy "Users can view own profile"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Admin can view all profiles"
  on profiles for select
  to authenticated
  using (true);

-- 3. AUTO-CREATE PROFILE TRIGGER
create or replace function create_profile_for_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure create_profile_for_user();

-- 4. BACKFILL: create profiles for existing auth users who have none
insert into profiles (id, email, full_name)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', '')
from auth.users u
where not exists (
  select 1 from profiles p where p.id = u.id
);
