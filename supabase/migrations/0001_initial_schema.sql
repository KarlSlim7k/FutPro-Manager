create extension if not exists pgcrypto;

create type public.app_role as enum (
  'super_admin',
  'league_admin',
  'team_admin',
  'coach',
  'referee',
  'viewer'
);

create type public.league_status as enum (
  'draft',
  'active',
  'archived',
  'inactive'
);

create type public.season_status as enum (
  'draft',
  'upcoming',
  'active',
  'completed',
  'archived'
);

create type public.team_status as enum (
  'active',
  'inactive',
  'archived'
);

create type public.player_status as enum (
  'active',
  'inactive',
  'injured',
  'suspended',
  'retired'
);

create type public.player_registration_status as enum (
  'active',
  'inactive',
  'released',
  'transferred'
);

create type public.match_status as enum (
  'scheduled',
  'in_progress',
  'completed',
  'postponed',
  'cancelled'
);

create type public.match_event_type as enum (
  'goal',
  'own_goal',
  'assist',
  'yellow_card',
  'red_card',
  'substitution',
  'penalty_goal',
  'penalty_miss'
);

create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'cancelled',
  'paused'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  display_name text,
  avatar_url text,
  phone text,
  global_role public.app_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) >= 3),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  region text,
  city text,
  state text,
  country text not null default 'Mexico',
  logo_url text,
  is_public boolean not null default true,
  status public.league_status not null default 'draft',
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.league_members (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.app_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (league_id, profile_id)
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues (id) on delete cascade,
  name text not null check (char_length(name) >= 2),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  start_date date not null,
  end_date date not null,
  status public.season_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (league_id, slug),
  check (end_date >= start_date)
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues (id) on delete cascade,
  name text not null check (char_length(name) >= 2),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  logo_url text,
  primary_color text check (
    primary_color is null or primary_color ~ '^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$'
  ),
  secondary_color text check (
    secondary_color is null or secondary_color ~ '^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$'
  ),
  founded_year int check (
    founded_year is null
    or (
      founded_year >= 1850
      and founded_year <= (extract(year from now())::int + 1)
    )
  ),
  status public.team_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (league_id, slug)
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.app_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, profile_id)
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues (id) on delete cascade,
  full_name text not null check (char_length(full_name) >= 3),
  birth_date date check (birth_date is null or birth_date <= current_date),
  photo_url text,
  preferred_position text,
  dominant_foot text check (
    dominant_foot is null or dominant_foot in ('left', 'right', 'both')
  ),
  status public.player_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.player_team_registrations (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  season_id uuid not null references public.seasons (id) on delete cascade,
  jersey_number int check (
    jersey_number is null or (jersey_number >= 0 and jersey_number <= 99)
  ),
  status public.player_registration_status not null default 'active',
  registered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (player_id, team_id, season_id)
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues (id) on delete cascade,
  name text not null check (char_length(name) >= 2),
  address text,
  city text,
  state text,
  latitude numeric(9, 6) check (latitude is null or (latitude >= -90 and latitude <= 90)),
  longitude numeric(9, 6) check (
    longitude is null or (longitude >= -180 and longitude <= 180)
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues (id) on delete cascade,
  season_id uuid not null references public.seasons (id) on delete cascade,
  home_team_id uuid not null references public.teams (id) on delete restrict,
  away_team_id uuid not null references public.teams (id) on delete restrict,
  venue_id uuid references public.venues (id) on delete set null,
  referee_id uuid references public.profiles (id) on delete set null,
  scheduled_at timestamptz not null,
  status public.match_status not null default 'scheduled',
  home_score int not null default 0 check (home_score >= 0),
  away_score int not null default 0 check (away_score >= 0),
  round_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (home_team_id <> away_team_id)
);

create table public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  team_id uuid references public.teams (id) on delete set null,
  player_id uuid references public.players (id) on delete set null,
  event_type public.match_event_type not null,
  minute int not null check (minute >= 0 and minute <= 130),
  notes text,
  created_by uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.standings (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues (id) on delete cascade,
  season_id uuid not null references public.seasons (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  played int not null default 0 check (played >= 0),
  won int not null default 0 check (won >= 0),
  drawn int not null default 0 check (drawn >= 0),
  lost int not null default 0 check (lost >= 0),
  goals_for int not null default 0 check (goals_for >= 0),
  goals_against int not null default 0 check (goals_against >= 0),
  goal_difference int not null default 0,
  points int not null default 0 check (points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (season_id, team_id),
  check (played = won + drawn + lost),
  check (goal_difference = goals_for - goals_against)
);

create table public.media_uploads (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id) on delete restrict,
  bucket text not null check (char_length(bucket) > 0),
  path text not null check (char_length(path) > 0),
  entity_type text not null check (char_length(entity_type) > 0),
  entity_id uuid,
  mime_type text,
  size_bytes bigint not null check (size_bytes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, path)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  league_id uuid references public.leagues (id) on delete set null,
  action text not null check (char_length(action) > 0),
  entity_type text not null check (char_length(entity_type) > 0),
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) >= 2),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  price_monthly numeric(10, 2) not null check (price_monthly >= 0),
  currency text not null default 'MXN' check (currency = upper(currency) and char_length(currency) = 3),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.league_subscriptions (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues (id) on delete cascade,
  plan_id uuid not null references public.subscription_plans (id) on delete restrict,
  status public.subscription_status not null default 'trialing',
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    current_period_end is null
    or current_period_start is null
    or current_period_end >= current_period_start
  )
);

create unique index idx_player_team_registrations_team_season_jersey
  on public.player_team_registrations (team_id, season_id, jersey_number)
  where jersey_number is not null;

create unique index idx_league_subscriptions_active_one_per_league
  on public.league_subscriptions (league_id)
  where status in ('trialing', 'active', 'past_due');

create index idx_teams_league_id on public.teams (league_id);
create index idx_teams_slug on public.teams (slug);
create index idx_seasons_league_id on public.seasons (league_id);
create index idx_matches_league_id on public.matches (league_id);
create index idx_matches_season_id on public.matches (season_id);
create index idx_matches_scheduled_at on public.matches (scheduled_at);
create index idx_player_team_registrations_player_id on public.player_team_registrations (player_id);
create index idx_player_team_registrations_team_id on public.player_team_registrations (team_id);
create index idx_standings_season_id on public.standings (season_id);
create index idx_standings_team_id on public.standings (team_id);
create index idx_league_members_profile_id on public.league_members (profile_id);
create index idx_team_members_profile_id on public.team_members (profile_id);

create index idx_leagues_status_public on public.leagues (status, is_public);
create index idx_matches_referee_id on public.matches (referee_id);
create index idx_media_uploads_league_id on public.media_uploads (league_id);
create index idx_audit_logs_league_id on public.audit_logs (league_id);
create index idx_players_league_id on public.players (league_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_profile_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select p.global_role
  from public.profiles p
  where p.id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'super_admin', false);
$$;

create or replace function public.has_league_role(target_league_id uuid, allowed_roles public.app_role[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when public.is_super_admin() then true
    else exists (
      select 1
      from public.league_members lm
      where lm.league_id = target_league_id
        and lm.profile_id = auth.uid()
        and (allowed_roles is null or lm.role = any(allowed_roles))
    )
  end;
$$;

create or replace function public.has_team_role(target_team_id uuid, allowed_roles public.app_role[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when public.is_super_admin() then true
    else exists (
      select 1
      from public.team_members tm
      where tm.team_id = target_team_id
        and tm.profile_id = auth.uid()
        and (allowed_roles is null or tm.role = any(allowed_roles))
    )
  end;
$$;

create or replace function public.has_league_team_role(target_league_id uuid, allowed_roles public.app_role[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when public.is_super_admin() then true
    else exists (
      select 1
      from public.team_members tm
      join public.teams t on t.id = tm.team_id
      where t.league_id = target_league_id
        and tm.profile_id = auth.uid()
        and (allowed_roles is null or tm.role = any(allowed_roles))
    )
  end;
$$;

create or replace function public.league_is_public_active(target_league_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.leagues l
    where l.id = target_league_id
      and l.is_public = true
      and l.status = 'active'
  );
$$;

create or replace function public.get_team_league_id(target_team_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select t.league_id
  from public.teams t
  where t.id = target_team_id;
$$;

create or replace function public.get_match_league_id(target_match_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.league_id
  from public.matches m
  where m.id = target_match_id;
$$;

create or replace function public.team_participates_in_match(target_match_id uuid, target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.matches m
    where m.id = target_match_id
      and (m.home_team_id = target_team_id or m.away_team_id = target_team_id)
  );
$$;

create or replace function public.can_access_league(target_league_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_league_role(target_league_id, null);
$$;

create or replace function public.can_manage_league(target_league_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_league_role(target_league_id, array['league_admin']::public.app_role[]);
$$;

create or replace function public.can_manage_team(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when public.is_super_admin() then true
    else (
      public.can_manage_league(public.get_team_league_id(target_team_id))
      or public.has_team_role(target_team_id, array['team_admin']::public.app_role[])
    )
  end;
$$;

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
      select m.referee_id is null or m.referee_id = auth.uid()
      from public.matches m
      where m.id = target_match_id
    )
    else false
  end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    display_name,
    avatar_url
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.handle_new_league_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.league_members (league_id, profile_id, role)
  values (new.id, new.created_by, 'league_admin')
  on conflict (league_id, profile_id) do nothing;

  return new;
end;
$$;

create or replace function public.ensure_profile_role_protection()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_super_admin() then
    if new.id <> old.id then
      raise exception 'No puedes cambiar el id del perfil';
    end if;

    if new.global_role <> old.global_role then
      raise exception 'No puedes cambiar tu global_role';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.ensure_player_registration_consistency()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player_league_id uuid;
  v_team_league_id uuid;
  v_season_league_id uuid;
begin
  select p.league_id into v_player_league_id
  from public.players p
  where p.id = new.player_id;

  select t.league_id into v_team_league_id
  from public.teams t
  where t.id = new.team_id;

  select s.league_id into v_season_league_id
  from public.seasons s
  where s.id = new.season_id;

  if v_player_league_id is null or v_team_league_id is null or v_season_league_id is null then
    raise exception 'player, team and season must exist';
  end if;

  if v_player_league_id <> v_team_league_id or v_team_league_id <> v_season_league_id then
    raise exception 'player, team and season must belong to the same league';
  end if;

  return new;
end;
$$;

create or replace function public.ensure_match_consistency()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_home_league_id uuid;
  v_away_league_id uuid;
  v_season_league_id uuid;
  v_venue_league_id uuid;
begin
  select t.league_id into v_home_league_id
  from public.teams t
  where t.id = new.home_team_id;

  select t.league_id into v_away_league_id
  from public.teams t
  where t.id = new.away_team_id;

  select s.league_id into v_season_league_id
  from public.seasons s
  where s.id = new.season_id;

  if new.venue_id is not null then
    select v.league_id into v_venue_league_id
    from public.venues v
    where v.id = new.venue_id;
  end if;

  if v_home_league_id is null or v_away_league_id is null or v_season_league_id is null then
    raise exception 'home team, away team and season must exist';
  end if;

  if new.league_id <> v_home_league_id
    or new.league_id <> v_away_league_id
    or new.league_id <> v_season_league_id then
    raise exception 'match league must match teams and season league';
  end if;

  if new.venue_id is not null and v_venue_league_id <> new.league_id then
    raise exception 'venue league must match match league';
  end if;

  return new;
end;
$$;

create or replace function public.ensure_match_event_consistency()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match_league_id uuid;
  v_match_season_id uuid;
  v_player_league_id uuid;
begin
  select m.league_id, m.season_id
    into v_match_league_id, v_match_season_id
  from public.matches m
  where m.id = new.match_id;

  if v_match_league_id is null then
    raise exception 'match must exist';
  end if;

  if new.team_id is not null and not public.team_participates_in_match(new.match_id, new.team_id) then
    raise exception 'team must participate in the match';
  end if;

  if new.player_id is not null then
    if new.team_id is null then
      raise exception 'team_id is required when player_id is present';
    end if;

    select p.league_id
      into v_player_league_id
    from public.players p
    where p.id = new.player_id;

    if v_player_league_id is null then
      raise exception 'player must exist';
    end if;

    if v_player_league_id <> v_match_league_id then
      raise exception 'player must belong to the same league as the match';
    end if;

    if not exists (
      select 1
      from public.player_team_registrations ptr
      where ptr.player_id = new.player_id
        and ptr.team_id = new.team_id
        and ptr.season_id = v_match_season_id
        and ptr.status = 'active'
    ) then
      raise exception 'player must have an active registration for the team in this season';
    end if;
  end if;

  if tg_op = 'INSERT' then
    if auth.uid() is not null and new.created_by <> auth.uid() and not public.is_super_admin() then
      raise exception 'created_by must match auth.uid()';
    end if;
  elsif tg_op = 'UPDATE' then
    if new.created_by <> old.created_by and not public.is_super_admin() then
      raise exception 'created_by cannot be changed';
    end if;
  end if;

  return new;
end;
$$;

create trigger on_profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger on_leagues_set_updated_at
before update on public.leagues
for each row execute function public.set_updated_at();

create trigger on_league_members_set_updated_at
before update on public.league_members
for each row execute function public.set_updated_at();

create trigger on_seasons_set_updated_at
before update on public.seasons
for each row execute function public.set_updated_at();

create trigger on_teams_set_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

create trigger on_team_members_set_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

create trigger on_players_set_updated_at
before update on public.players
for each row execute function public.set_updated_at();

create trigger on_player_team_registrations_set_updated_at
before update on public.player_team_registrations
for each row execute function public.set_updated_at();

create trigger on_venues_set_updated_at
before update on public.venues
for each row execute function public.set_updated_at();

create trigger on_matches_set_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

create trigger on_match_events_set_updated_at
before update on public.match_events
for each row execute function public.set_updated_at();

create trigger on_standings_set_updated_at
before update on public.standings
for each row execute function public.set_updated_at();

create trigger on_media_uploads_set_updated_at
before update on public.media_uploads
for each row execute function public.set_updated_at();

create trigger on_audit_logs_set_updated_at
before update on public.audit_logs
for each row execute function public.set_updated_at();

create trigger on_subscription_plans_set_updated_at
before update on public.subscription_plans
for each row execute function public.set_updated_at();

create trigger on_league_subscriptions_set_updated_at
before update on public.league_subscriptions
for each row execute function public.set_updated_at();

create trigger on_profiles_protect_role
before update on public.profiles
for each row execute function public.ensure_profile_role_protection();

create trigger on_player_team_registrations_consistency
before insert or update on public.player_team_registrations
for each row execute function public.ensure_player_registration_consistency();

create trigger on_matches_consistency
before insert or update on public.matches
for each row execute function public.ensure_match_consistency();

create trigger on_match_events_consistency
before insert or update on public.match_events
for each row execute function public.ensure_match_event_consistency();

insert into public.profiles (
  id,
  full_name,
  display_name,
  avatar_url
)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  nullif(
    coalesce(
      u.raw_user_meta_data ->> 'display_name',
      split_part(coalesce(u.email, ''), '@', 1)
    ),
    ''
  ),
  u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
on conflict (id) do nothing;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create trigger on_league_created_add_creator_member
after insert on public.leagues
for each row execute function public.handle_new_league_membership();

alter table public.profiles enable row level security;
alter table public.leagues enable row level security;
alter table public.league_members enable row level security;
alter table public.seasons enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.players enable row level security;
alter table public.player_team_registrations enable row level security;
alter table public.venues enable row level security;
alter table public.matches enable row level security;
alter table public.match_events enable row level security;
alter table public.standings enable row level security;
alter table public.media_uploads enable row level security;
alter table public.audit_logs enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.league_subscriptions enable row level security;

create policy "profiles_select_own_or_super_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_super_admin());

create policy "profiles_update_own_or_super_admin"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_super_admin())
with check (id = auth.uid() or public.is_super_admin());

create policy "profiles_insert_self_or_super_admin"
on public.profiles
for insert
to authenticated
with check (id = auth.uid() or public.is_super_admin());

create policy "profiles_delete_super_admin_only"
on public.profiles
for delete
to authenticated
using (public.is_super_admin());

create policy "leagues_public_or_member_read"
on public.leagues
for select
to anon, authenticated
using (
  public.league_is_public_active(id)
  or public.can_access_league(id)
);

create policy "leagues_insert_authenticated_creator"
on public.leagues
for insert
to authenticated
with check (created_by = auth.uid());

create policy "leagues_update_manage_league"
on public.leagues
for update
to authenticated
using (public.can_manage_league(id))
with check (public.can_manage_league(id));

create policy "leagues_delete_manage_league"
on public.leagues
for delete
to authenticated
using (public.can_manage_league(id));

create policy "league_members_select_self_or_league_access"
on public.league_members
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.can_access_league(league_id)
);

create policy "league_members_insert_manage_league"
on public.league_members
for insert
to authenticated
with check (public.can_manage_league(league_id));

create policy "league_members_update_manage_league"
on public.league_members
for update
to authenticated
using (public.can_manage_league(league_id))
with check (public.can_manage_league(league_id));

create policy "league_members_delete_manage_league"
on public.league_members
for delete
to authenticated
using (public.can_manage_league(league_id));

create policy "seasons_public_or_member_read"
on public.seasons
for select
to anon, authenticated
using (
  public.league_is_public_active(league_id)
  or public.can_access_league(league_id)
);

create policy "seasons_manage_league_write"
on public.seasons
for all
to authenticated
using (public.can_manage_league(league_id))
with check (public.can_manage_league(league_id));

create policy "teams_public_or_member_read"
on public.teams
for select
to anon, authenticated
using (
  public.league_is_public_active(league_id)
  or public.can_access_league(league_id)
);

create policy "teams_insert_manage_league"
on public.teams
for insert
to authenticated
with check (public.can_manage_league(league_id));

create policy "teams_update_manage_team_or_league"
on public.teams
for update
to authenticated
using (public.can_manage_league(league_id) or public.can_manage_team(id))
with check (public.can_manage_league(league_id) or public.can_manage_team(id));

create policy "teams_delete_manage_team_or_league"
on public.teams
for delete
to authenticated
using (public.can_manage_league(league_id) or public.can_manage_team(id));

create policy "team_members_select_with_access"
on public.team_members
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.can_manage_team(team_id)
  or public.has_team_role(team_id, array['coach', 'team_admin']::public.app_role[])
  or public.can_access_league(public.get_team_league_id(team_id))
);

create policy "team_members_insert_manage_team_or_league"
on public.team_members
for insert
to authenticated
with check (
  public.can_manage_team(team_id)
  or public.can_manage_league(public.get_team_league_id(team_id))
);

create policy "team_members_update_manage_team_or_league"
on public.team_members
for update
to authenticated
using (
  public.can_manage_team(team_id)
  or public.can_manage_league(public.get_team_league_id(team_id))
)
with check (
  public.can_manage_team(team_id)
  or public.can_manage_league(public.get_team_league_id(team_id))
);

create policy "team_members_delete_manage_team_or_league"
on public.team_members
for delete
to authenticated
using (
  public.can_manage_team(team_id)
  or public.can_manage_league(public.get_team_league_id(team_id))
);

create policy "players_select_league_access"
on public.players
for select
to authenticated
using (public.can_access_league(league_id));

create policy "players_write_league_admin_team_staff"
on public.players
for all
to authenticated
using (
  public.can_manage_league(league_id)
  or public.has_league_team_role(league_id, array['team_admin', 'coach']::public.app_role[])
)
with check (
  public.can_manage_league(league_id)
  or public.has_league_team_role(league_id, array['team_admin', 'coach']::public.app_role[])
);

create policy "player_registrations_public_or_member_read"
on public.player_team_registrations
for select
to anon, authenticated
using (
  public.league_is_public_active(public.get_team_league_id(team_id))
  or public.can_access_league(public.get_team_league_id(team_id))
);

create policy "player_registrations_write_league_admin_team_staff"
on public.player_team_registrations
for all
to authenticated
using (
  public.can_manage_league(public.get_team_league_id(team_id))
  or public.has_team_role(team_id, array['team_admin', 'coach']::public.app_role[])
)
with check (
  public.can_manage_league(public.get_team_league_id(team_id))
  or public.has_team_role(team_id, array['team_admin', 'coach']::public.app_role[])
);

create policy "venues_public_or_member_read"
on public.venues
for select
to anon, authenticated
using (
  public.league_is_public_active(league_id)
  or public.can_access_league(league_id)
);

create policy "venues_manage_league_write"
on public.venues
for all
to authenticated
using (public.can_manage_league(league_id))
with check (public.can_manage_league(league_id));

create policy "matches_public_or_member_read"
on public.matches
for select
to anon, authenticated
using (
  public.league_is_public_active(league_id)
  or public.can_access_league(league_id)
);

create policy "matches_insert_manage_league"
on public.matches
for insert
to authenticated
with check (public.can_manage_league(league_id));

create policy "matches_update_manage_or_referee"
on public.matches
for update
to authenticated
using (public.can_manage_match(id))
with check (public.can_manage_match(id));

create policy "matches_delete_manage_league"
on public.matches
for delete
to authenticated
using (public.can_manage_league(league_id));

create policy "match_events_public_or_member_read"
on public.match_events
for select
to anon, authenticated
using (
  public.league_is_public_active(public.get_match_league_id(match_id))
  or public.can_access_league(public.get_match_league_id(match_id))
);

create policy "match_events_insert_manage_referee_team_staff"
on public.match_events
for insert
to authenticated
with check (
  created_by = auth.uid()
  and (
    public.can_manage_match(match_id)
    or (
      team_id is not null
      and public.team_participates_in_match(match_id, team_id)
      and public.has_team_role(team_id, array['team_admin', 'coach']::public.app_role[])
    )
  )
);

create policy "match_events_update_manage_referee_team_staff"
on public.match_events
for update
to authenticated
using (
  public.can_manage_match(match_id)
  or (
    team_id is not null
    and public.team_participates_in_match(match_id, team_id)
    and public.has_team_role(team_id, array['team_admin', 'coach']::public.app_role[])
  )
)
with check (
  public.can_manage_match(match_id)
  or (
    team_id is not null
    and public.team_participates_in_match(match_id, team_id)
    and public.has_team_role(team_id, array['team_admin', 'coach']::public.app_role[])
  )
);

create policy "match_events_delete_manage_referee_team_staff"
on public.match_events
for delete
to authenticated
using (
  public.can_manage_match(match_id)
  or (
    team_id is not null
    and public.team_participates_in_match(match_id, team_id)
    and public.has_team_role(team_id, array['team_admin', 'coach']::public.app_role[])
  )
);

create policy "standings_public_or_member_read"
on public.standings
for select
to anon, authenticated
using (
  public.league_is_public_active(league_id)
  or public.can_access_league(league_id)
);

create policy "standings_manage_league_write"
on public.standings
for all
to authenticated
using (public.can_manage_league(league_id))
with check (public.can_manage_league(league_id));

create policy "media_uploads_member_read"
on public.media_uploads
for select
to authenticated
using (public.can_access_league(league_id));

create policy "media_uploads_insert_member"
on public.media_uploads
for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and public.can_access_league(league_id)
);

create policy "media_uploads_update_owner_or_league_admin"
on public.media_uploads
for update
to authenticated
using (
  uploaded_by = auth.uid()
  or public.can_manage_league(league_id)
)
with check (
  uploaded_by = auth.uid()
  or public.can_manage_league(league_id)
);

create policy "media_uploads_delete_owner_or_league_admin"
on public.media_uploads
for delete
to authenticated
using (
  uploaded_by = auth.uid()
  or public.can_manage_league(league_id)
);

create policy "audit_logs_select_super_or_league_admin"
on public.audit_logs
for select
to authenticated
using (
  public.is_super_admin()
  or (league_id is not null and public.can_manage_league(league_id))
);

create policy "audit_logs_insert_actor"
on public.audit_logs
for insert
to authenticated
with check (
  actor_id = auth.uid()
  and (league_id is null or public.can_access_league(league_id))
);

create policy "subscription_plans_select_active_public"
on public.subscription_plans
for select
to anon, authenticated
using (is_active = true);

create policy "subscription_plans_select_all_for_super_admin"
on public.subscription_plans
for select
to authenticated
using (public.is_super_admin());

create policy "subscription_plans_write_super_admin"
on public.subscription_plans
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "league_subscriptions_select_league_access"
on public.league_subscriptions
for select
to authenticated
using (
  public.can_access_league(league_id)
  or public.is_super_admin()
);

create policy "league_subscriptions_write_super_admin"
on public.league_subscriptions
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());
