-- =============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Fixes: "user_id column not found" + all schema issues
-- =============================================

-- STEP 1: Drop old broken table (removes bad FK on user_id)
drop table if exists verification_codes cascade;

-- STEP 2: Recreate with correct schema (user_id has NO foreign key)
create table verification_codes (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid,          -- plain uuid, no FK — intentional
  email      text not null,
  code       text not null,
  expires_at timestamptz not null,
  used       boolean default false,
  created_at timestamptz default now()
);

-- STEP 3: Indexes for fast lookup
create index idx_vc_email   on verification_codes(email);
create index idx_vc_user_id on verification_codes(user_id);

-- STEP 4: Enable RLS (service role key bypasses this automatically)
alter table verification_codes enable row level security;

-- STEP 5: Ensure profiles has is_verified column
alter table profiles add column if not exists is_verified boolean default false;

-- STEP 6: Cleanup function for expired codes
create or replace function delete_expired_verification_codes()
returns void as $$
begin
  delete from verification_codes where expires_at < now();
end;
$$ language plpgsql security definer;
