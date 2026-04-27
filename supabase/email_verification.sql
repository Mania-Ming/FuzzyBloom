-- =============================================
-- EMAIL VERIFICATION SYSTEM
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add is_verified column to profiles
alter table profiles add column if not exists is_verified boolean default false;

-- 2. Create verification_codes table
create table if not exists verification_codes (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade,
  email      text not null,
  code       text not null,
  expires_at timestamptz not null,
  used       boolean default false,
  created_at timestamptz default now()
);

-- Index for fast lookup
create index if not exists idx_verification_codes_email on verification_codes(email);
create index if not exists idx_verification_codes_user_id on verification_codes(user_id);

-- RLS: only service role can access (no policies needed)
alter table verification_codes enable row level security;

-- 3. Auto-cleanup function (optional — run manually or via cron)
create or replace function delete_expired_verification_codes()
returns void as $$
begin
  delete from verification_codes where expires_at < now();
end;
$$ language plpgsql security definer;

-- To manually clean: select delete_expired_verification_codes();
