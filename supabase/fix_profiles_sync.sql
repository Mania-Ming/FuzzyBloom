-- =============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Fixes: profiles not created, trigger missing, role mismatch
-- =============================================

-- 1. Ensure profiles table has all required columns
alter table profiles add column if not exists is_verified   boolean default false;
alter table profiles add column if not exists role          text default 'customer';
alter table profiles add column if not exists phone         text;
alter table profiles add column if not exists address       text;
alter table profiles add column if not exists profile_image text;

-- 2. Recreate trigger function with role = 'customer'
create or replace function create_profile_for_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, is_verified)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'customer',
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- 3. Recreate trigger safely
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure create_profile_for_user();

-- 4. Backfill: create profiles for existing users who have none
insert into public.profiles (id, email, full_name, role, is_verified)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  'customer',
  false
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- 5. Fix existing profiles that have null or 'user' role
update public.profiles
set role = 'customer'
where role is null or role = 'user';
