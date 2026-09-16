-- Migración: Auditoría Automática vía Triggers SQL (Best-effort y non-blocking)
-- Fecha: 2026-09-16
-- Descripción:
-- 1. Crea la función trg_auto_audit_log() que registra mutaciones en audit_logs de forma transparente.
-- 2. Instala triggers AFTER en matches, match_events, match_officials, team_members y player_team_registrations.
-- 3. Maneja excepciones internamente (non-blocking) para no abortar transacciones de negocio.

create or replace function public.trg_auto_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid;
  v_league_id uuid;
  v_action text;
  v_entity_type text;
  v_entity_id uuid;
  v_metadata jsonb := '{}'::jsonb;
begin
  -- 1. Capturar actor del contexto JWT de Supabase (o null si es proceso interno)
  v_actor_id := auth.uid();

  -- 2. Determinar tabla y operación
  if TG_TABLE_NAME = 'matches' then
    v_entity_type := 'match';
    v_entity_id := coalesce(new.id, old.id);
    v_league_id := coalesce(new.league_id, old.league_id);

    if TG_OP = 'INSERT' then
      v_action := 'match.created_auto';
      v_metadata := jsonb_build_object(
        'source', 'sql_trigger',
        'status', new.status,
        'scheduled_at', new.scheduled_at,
        'home_team_id', new.home_team_id,
        'away_team_id', new.away_team_id
      );
    elsif TG_OP = 'UPDATE' then
      v_action := 'match.updated_auto';
      v_metadata := jsonb_build_object(
        'source', 'sql_trigger',
        'previous_status', old.status,
        'new_status', new.status,
        'previous_home_score', old.home_score,
        'new_home_score', new.home_score,
        'previous_away_score', old.away_score,
        'new_away_score', new.away_score,
        'previous_referee_id', old.referee_id,
        'new_referee_id', new.referee_id
      );
    elsif TG_OP = 'DELETE' then
      v_action := 'match.deleted_auto';
      v_metadata := jsonb_build_object(
        'source', 'sql_trigger',
        'status', old.status,
        'scheduled_at', old.scheduled_at
      );
    end if;

  elsif TG_TABLE_NAME = 'match_events' then
    v_entity_type := 'match_event';
    v_entity_id := coalesce(new.id, old.id);

    select m.league_id into v_league_id
    from public.matches m
    where m.id = coalesce(new.match_id, old.match_id);

    if TG_OP = 'INSERT' then
      v_action := 'match.event_created_auto';
      v_metadata := jsonb_build_object(
        'source', 'sql_trigger',
        'match_id', new.match_id,
        'team_id', new.team_id,
        'player_id', new.player_id,
        'event_type', new.event_type,
        'minute', new.minute
      );
    elsif TG_OP = 'DELETE' then
      v_action := 'match.event_deleted_auto';
      v_metadata := jsonb_build_object(
        'source', 'sql_trigger',
        'match_id', old.match_id,
        'team_id', old.team_id,
        'player_id', old.player_id,
        'event_type', old.event_type,
        'minute', old.minute
      );
    end if;

  elsif TG_TABLE_NAME = 'match_officials' then
    v_entity_type := 'match_official';
    v_entity_id := coalesce(new.id, old.id);

    select m.league_id into v_league_id
    from public.matches m
    where m.id = coalesce(new.match_id, old.match_id);

    if TG_OP = 'INSERT' then
      v_action := 'match.official_assigned_auto';
      v_metadata := jsonb_build_object(
        'source', 'sql_trigger',
        'match_id', new.match_id,
        'profile_id', new.profile_id,
        'role', new.role
      );
    elsif TG_OP = 'DELETE' then
      v_action := 'match.official_removed_auto';
      v_metadata := jsonb_build_object(
        'source', 'sql_trigger',
        'match_id', old.match_id,
        'profile_id', old.profile_id,
        'role', old.role
      );
    end if;

  elsif TG_TABLE_NAME = 'team_members' then
    v_entity_type := 'team_member';
    v_entity_id := coalesce(new.id, old.id);

    select t.league_id into v_league_id
    from public.teams t
    where t.id = coalesce(new.team_id, old.team_id);

    if TG_OP = 'INSERT' then
      v_action := 'team_member.created_auto';
      v_metadata := jsonb_build_object(
        'source', 'sql_trigger',
        'team_id', new.team_id,
        'profile_id', new.profile_id,
        'role', new.role
      );
    elsif TG_OP = 'UPDATE' then
      v_action := 'team_member.role_updated_auto';
      v_metadata := jsonb_build_object(
        'source', 'sql_trigger',
        'team_id', new.team_id,
        'profile_id', new.profile_id,
        'old_role', old.role,
        'new_role', new.role
      );
    elsif TG_OP = 'DELETE' then
      v_action := 'team_member.removed_auto';
      v_metadata := jsonb_build_object(
        'source', 'sql_trigger',
        'team_id', old.team_id,
        'profile_id', old.profile_id,
        'role', old.role
      );
    end if;

  elsif TG_TABLE_NAME = 'player_team_registrations' then
    v_entity_type := 'player_registration';
    v_entity_id := coalesce(new.id, old.id);

    select t.league_id into v_league_id
    from public.teams t
    where t.id = coalesce(new.team_id, old.team_id);

    if TG_OP = 'INSERT' then
      v_action := 'player.registration_created_auto';
      v_metadata := jsonb_build_object(
        'source', 'sql_trigger',
        'team_id', new.team_id,
        'player_id', new.player_id,
        'season_id', new.season_id,
        'jersey_number', new.jersey_number,
        'status', new.status
      );
    elsif TG_OP = 'UPDATE' then
      v_action := 'player.registration_updated_auto';
      v_metadata := jsonb_build_object(
        'source', 'sql_trigger',
        'team_id', new.team_id,
        'player_id', new.player_id,
        'previous_jersey_number', old.jersey_number,
        'new_jersey_number', new.jersey_number,
        'previous_status', old.status,
        'new_status', new.status
      );
    elsif TG_OP = 'DELETE' then
      v_action := 'player.registration_deleted_auto';
      v_metadata := jsonb_build_object(
        'source', 'sql_trigger',
        'team_id', old.team_id,
        'player_id', old.player_id,
        'season_id', old.season_id
      );
    end if;
  end if;

  -- 3. Inserción protegida en audit_logs (best-effort, fail-safe)
  if v_action is not null then
    begin
      insert into public.audit_logs (
        actor_id,
        league_id,
        action,
        entity_type,
        entity_id,
        metadata
      ) values (
        v_actor_id,
        v_league_id,
        v_action,
        v_entity_type,
        v_entity_id,
        v_metadata
      );
    exception when others then
      -- Non-blocking: un error en la auditoría nunca aborta la transacción principal
      raise warning 'trg_auto_audit_log warning: %', sqlerrm;
    end;
  end if;

  return coalesce(new, old);
end;
$$;

-- Instalación de triggers en tablas correspondientes
drop trigger if exists trg_audit_matches on public.matches;
create trigger trg_audit_matches
  after insert or update or delete on public.matches
  for each row execute function public.trg_auto_audit_log();

drop trigger if exists trg_audit_match_events on public.match_events;
create trigger trg_audit_match_events
  after insert or delete on public.match_events
  for each row execute function public.trg_auto_audit_log();

drop trigger if exists trg_audit_match_officials on public.match_officials;
create trigger trg_audit_match_officials
  after insert or delete on public.match_officials
  for each row execute function public.trg_auto_audit_log();

drop trigger if exists trg_audit_team_members on public.team_members;
create trigger trg_audit_team_members
  after insert or update or delete on public.team_members
  for each row execute function public.trg_auto_audit_log();

drop trigger if exists trg_audit_player_registrations on public.player_team_registrations;
create trigger trg_audit_player_registrations
  after insert or update or delete on public.player_team_registrations
  for each row execute function public.trg_auto_audit_log();
