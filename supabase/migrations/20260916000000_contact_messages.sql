-- Contact messages from the public contact form.
-- Anyone (anon + authenticated) can insert; only service_role / super_admins can read.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  league_name text,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "contact_messages_insert_anyone" on public.contact_messages;
create policy "contact_messages_insert_anyone"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- No select/update/delete policies for anon/authenticated:
-- reads are service_role only (dashboard / support tooling).
