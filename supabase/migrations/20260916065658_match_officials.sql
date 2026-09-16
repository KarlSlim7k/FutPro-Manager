-- Migration: Multi-árbitro (match_officials: head_referee, first_assistant, second_assistant, fourth_official)
-- Mantener compatibilidad total con matches.referee_id existente.
-- Rollback plan:
-- drop trigger if exists trg_sync_match_head_referee on public.match_officials;
-- drop function if exists public.sync_match_head_referee();
-- drop table if exists public.match_officials cascade;
-- drop type if exists public.match_official_role cascade;
-- (revert can_manage_match to original definition)

create type public.match_official_role as enum (
  'head_referee',
  'first_assistant',
  'second_assistant',
  'fourth_official'
);

create table public.match_officials (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.match_official_role not null default 'head_referee',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint match_officials_match_role_unique unique (match_id, role),
  constraint match_officials_match_profile_unique unique (match_id, profile_id)
);

create index idx_match_officials_match_id on public.match_officials (match_id);
create index idx_match_officials_profile_id on public.match_officials (profile_id);

alter table public.match_officials enable row level security;

create policy "match_officials_select"
on public.match_officials
for select
to anon, authenticated
using (
  public.league_is_public_active(public.get_match_league_id(match_id))
  or public.can_access_league(public.get_match_league_id(match_id))
);

create policy "match_officials_manage_league"
on public.match_officials
for all
to authenticated
using (public.can_manage_league(public.get_match_league_id(match_id)))
with check (public.can_manage_league(public.get_match_league_id(match_id)));

create trigger on_match_officials_set_updated_at
before update on public.match_officials
for each row execute function public.set_updated_at();

-- Backfill de árbitros existentes a la tabla match_officials como head_referee
insert into public.match_officials (match_id, profile_id, role)
select id, referee_id, 'head_referee'::public.match_official_role
from public.matches
where referee_id is not null
on conflict do nothing;

-- Sincronización automática: mantener matches.referee_id sincronizado con head_referee
create or replace function public.sync_match_head_referee()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or tg_op = 'UPDATE' then
    if new.role = 'head_referee' then
      update public.matches
      set referee_id = new.profile_id
      where id = new.match_id and (referee_id is distinct from new.profile_id);
    end if;
  elsif tg_op = 'DELETE' then
    if old.role = 'head_referee' then
      update public.matches
      set referee_id = null
      where id = old.match_id and referee_id = old.profile_id;
    end if;
  end if;
  return null;
end;
$$;

create trigger trg_sync_match_head_referee
after insert or update or delete on public.match_officials
for each row execute function public.sync_match_head_referee();

-- Actualización de can_manage_match para incluir a cualquier oficial asignado
create or replace function public.can_manage_match(target_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when public.is_super_admin() then true
    when public.can_manage_league(public.get_match_league_id(target_match_id)) then true
    when public.has_league_role(
      public.get_match_league_id(target_match_id),
      array['referee']::public.app_role[]
    ) then (
      select m.referee_id is null
        or m.referee_id = auth.uid()
        or exists (
          select 1 from public.match_officials mo
          where mo.match_id = target_match_id
            and mo.profile_id = auth.uid()
        )
      from public.matches m
      where m.id = target_match_id
    )
    else false
  end;
$$;

grant select on public.match_officials to anon, authenticated;
grant insert, update, delete on public.match_officials to authenticated;
