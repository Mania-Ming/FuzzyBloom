-- ─── Drop existing policies to avoid conflicts ────────────────────────────────
drop policy if exists "Users can view own conversations"         on conversations;
drop policy if exists "Admins can view all conversations"        on conversations;
drop policy if exists "Users can create conversations"           on conversations;
drop policy if exists "Admins can update conversations"          on conversations;
drop policy if exists "Conversation participants can view messages"  on messages;
drop policy if exists "Conversation participants can send messages"  on messages;
drop policy if exists "Admins can mark messages as read"             on messages;
drop policy if exists "Users can mark own conversation messages as read" on messages;

-- ─── Conversations table ──────────────────────────────────────────────────────
create table if not exists conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  admin_id   uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table conversations enable row level security;

-- Users see their own; admins see all
create policy "conv_select"
  on conversations for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Any authenticated user can create a conversation for themselves
create policy "conv_insert"
  on conversations for insert
  with check (auth.uid() = user_id);

-- Admins can update (assign admin_id etc.)
create policy "conv_update"
  on conversations for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── Messages table ───────────────────────────────────────────────────────────
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references auth.users(id) on delete cascade,
  message         text not null,
  is_read         boolean default false,
  created_at      timestamptz default now()
);

alter table messages enable row level security;

-- Participants (user who owns the conversation OR any admin) can read messages
create policy "msg_select"
  on messages for select
  using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (
          c.user_id = auth.uid()
          or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
        )
    )
  );

-- Any authenticated participant can insert a message
create policy "msg_insert"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (
          c.user_id = auth.uid()
          or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
        )
    )
  );

-- Participants can mark messages as read
create policy "msg_update"
  on messages for update
  using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (
          c.user_id = auth.uid()
          or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
        )
    )
  );

-- ─── Realtime ─────────────────────────────────────────────────────────────────
-- Run these only if not already added (safe to re-run)
do $$
begin
  begin
    alter publication supabase_realtime add table messages;
  exception when others then null;
  end;
  begin
    alter publication supabase_realtime add table conversations;
  exception when others then null;
  end;
end $$;
