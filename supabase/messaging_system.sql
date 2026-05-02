-- ─── Conversations ────────────────────────────────────────────────────────────
create table if not exists conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  admin_id   uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table conversations enable row level security;

create policy "Users can view own conversations"
  on conversations for select
  using (auth.uid() = user_id);

create policy "Admins can view all conversations"
  on conversations for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Users can create conversations"
  on conversations for insert
  with check (auth.uid() = user_id);

create policy "Admins can update conversations"
  on conversations for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ─── Messages ─────────────────────────────────────────────────────────────────
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references auth.users(id) on delete cascade,
  message         text not null,
  is_read         boolean default false,
  created_at      timestamptz default now()
);

alter table messages enable row level security;

create policy "Conversation participants can view messages"
  on messages for select
  using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (c.user_id = auth.uid() or exists (
          select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  );

create policy "Conversation participants can send messages"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (c.user_id = auth.uid() or exists (
          select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  );

create policy "Admins can mark messages as read"
  on messages for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Users can mark own conversation messages as read"
  on messages for update
  using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );

-- ─── Realtime ─────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;
