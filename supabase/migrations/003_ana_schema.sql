-- ============================================================
-- Migration 003: Ana conversation history
-- Stores per-user message threads so Ana has context across
-- turns. Deleted on user request via the delete_ana_data tool.
-- ============================================================

create table if not exists public.ana_messages (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references public.users(id) on delete cascade not null,
  conversation_id uuid not null,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  created_at      timestamptz default now()
);

create index if not exists ana_messages_user_conv_idx
  on public.ana_messages(user_id, conversation_id, created_at desc);

alter table public.ana_messages enable row level security;

create policy "Users can manage own Ana messages"
  on public.ana_messages for all using (auth.uid() = user_id);
