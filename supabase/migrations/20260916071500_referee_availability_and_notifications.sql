-- Migración: Disponibilidad y Notificaciones de Árbitros
-- Fecha: 2026-09-16
-- Descripción:
-- 1. Crea la tabla referee_availabilities para registrar indisponibilidad/disponibilidad de árbitros con RLS.
-- 2. Crea la tabla user_notifications para alertas in-app (designaciones de árbitro, cambios, avisos de sistema).

-- ----------------------------------------------------------------------------
-- 1. Tabla de disponibilidad arbitral
-- ----------------------------------------------------------------------------
create table if not exists public.referee_availabilities (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  league_id uuid not null references public.leagues(id) on delete cascade,
  date date not null,
  start_time time,
  end_time time,
  status text not null default 'unavailable' check (status in ('available', 'unavailable', 'tentative')),
  notes text,
  created_at timestamp with time zone default now() not null,
  constraint referee_availabilities_profile_league_date_key unique (profile_id, league_id, date)
);

create index if not exists idx_referee_availabilities_profile_date
  on public.referee_availabilities(profile_id, date);

create index if not exists idx_referee_availabilities_league_date
  on public.referee_availabilities(league_id, date);

alter table public.referee_availabilities enable row level security;

-- Políticas RLS para referee_availabilities
create policy referee_availabilities_select on public.referee_availabilities
  for select
  using (
    profile_id = auth.uid()
    or public.can_manage_league(league_id)
  );

create policy referee_availabilities_insert on public.referee_availabilities
  for insert
  with check (
    (
      profile_id = auth.uid()
      and exists (
        select 1 from public.league_members lm
        where lm.league_id = referee_availabilities.league_id
          and lm.profile_id = auth.uid()
      )
    )
    or public.can_manage_league(league_id)
  );

create policy referee_availabilities_update on public.referee_availabilities
  for update
  using (
    profile_id = auth.uid()
    or public.can_manage_league(league_id)
  )
  with check (
    profile_id = auth.uid()
    or public.can_manage_league(league_id)
  );

create policy referee_availabilities_delete on public.referee_availabilities
  for delete
  using (
    profile_id = auth.uid()
    or public.can_manage_league(league_id)
  );

-- ----------------------------------------------------------------------------
-- 2. Tabla de notificaciones de usuario (In-App)
-- ----------------------------------------------------------------------------
create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  league_id uuid references public.leagues(id) on delete cascade,
  type text not null default 'match_assignment',
  title text not null,
  message text not null,
  link_url text,
  read_at timestamp with time zone,
  created_at timestamp with time zone default now() not null
);

create index if not exists idx_user_notifications_user_unread
  on public.user_notifications(user_id, read_at)
  where read_at is null;

create index if not exists idx_user_notifications_user_created
  on public.user_notifications(user_id, created_at desc);

alter table public.user_notifications enable row level security;

-- Políticas RLS para user_notifications
create policy user_notifications_select on public.user_notifications
  for select
  using (user_id = auth.uid());

create policy user_notifications_insert on public.user_notifications
  for insert
  with check (
    auth.uid() is not null
    and (
      user_id = auth.uid()
      or (league_id is not null and public.can_manage_league(league_id))
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.global_role = 'super_admin'
      )
    )
  );

create policy user_notifications_update on public.user_notifications
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy user_notifications_delete on public.user_notifications
  for delete
  using (user_id = auth.uid());
