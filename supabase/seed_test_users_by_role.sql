-- ============================================================
-- FutPro Manager · Cuentas de prueba por rol (ambas ligas)
-- ============================================================
-- Ligas: Primera Fuerza Especial + Primera A
-- Equipos scope: Molinos (existe en ambas ligas)
--
-- PASO 1 (Dashboard Supabase):
--   Authentication > Users > Add user > Create new user
--   Crea estos 6 con "Auto Confirm user = ON" y password FutPro123!
--   (usa un dominio válido: gmail/outlook/tu dominio.
--    @test.com es rechazado por Supabase con "email_address_invalid")
--
--   Super Admin .... superadmin@futpromanager.com
--   League Admin ... leagueadmin@futpromanager.com
--   Team Admin ..... teamadmin@futpromanager.com
--   Coach .......... coach@futpromanager.com
--   Referee ........ referee@futpromanager.com
--   Viewer ......... viewer@futpromanager.com
--
-- PASO 2:
--   Edita el bloque CONFIG con los 6 emails reales,
--   pégalo en SQL Editor > New query > Run.
--
-- PASO 3:
--   Inicia sesión en la plataforma con cada cuenta + FutPro123!
--
-- NOTA: este script corre como postgres en el SQL Editor,
-- por eso puede asignar global_role y membresías (bypassa RLS).
-- ============================================================

-- ---------- CONFIG: edita los 6 emails dentro del bloque DO de abajo ---------- --
-- (deben coincidir EXACTO con los creados en el PASO 1)

do $$
declare
  v_superadmin_email  text := 'superadmin@futpromanager.com';
  v_leagueadmin_email text := 'leagueadmin@futpromanager.com';
  v_teamadmin_email   text := 'teamadmin@futpromanager.com';
  v_coach_email       text := 'coach@futpromanager.com';
  v_referee_email     text := 'referee@futpromanager.com';
  v_viewer_email      text := 'viewer@futpromanager.com';

  v_superadmin_id  uuid;
  v_leagueadmin_id uuid;
  v_teamadmin_id   uuid;
  v_coach_id       uuid;
  v_referee_id     uuid;
  v_viewer_id      uuid;

  v_liga_fuerza uuid;
  v_liga_a      uuid;
  v_molinos_fuerza uuid;
  v_molinos_a      uuid;
  v_match_fuerza uuid;
  v_match_a      uuid;
begin
  -- Resolver ids de auth.users por email
  select id into v_superadmin_id  from auth.users where email = v_superadmin_email;
  select id into v_leagueadmin_id from auth.users where email = v_leagueadmin_email;
  select id into v_teamadmin_id   from auth.users where email = v_teamadmin_email;
  select id into v_coach_id       from auth.users where email = v_coach_email;
  select id into v_referee_id     from auth.users where email = v_referee_email;
  select id into v_viewer_id      from auth.users where email = v_viewer_email;

  if v_superadmin_id is null then raise exception 'No existe usuario % (créalo en Authentication > Add user con Auto Confirm ON)', v_superadmin_email; end if;
  if v_leagueadmin_id is null then raise exception 'No existe usuario %', v_leagueadmin_email; end if;
  if v_teamadmin_id is null then raise exception 'No existe usuario %', v_teamadmin_email; end if;
  if v_coach_id is null then raise exception 'No existe usuario %', v_coach_email; end if;
  if v_referee_id is null then raise exception 'No existe usuario %', v_referee_email; end if;
  if v_viewer_id is null then raise exception 'No existe usuario %', v_viewer_email; end if;

  -- Ligas y equipos scope (Molinos existe en ambas)
  select id into v_liga_fuerza from public.leagues where slug = 'primera-fuerza-especial';
  select id into v_liga_a      from public.leagues where slug = 'primera-a';
  select id into v_molinos_fuerza from public.teams where league_id = v_liga_fuerza and slug = 'molinos';
  select id into v_molinos_a      from public.teams where league_id = v_liga_a and slug = 'molinos';

  -- ---------- 1. GLOBAL ROLES ---------- --
  -- super_admin: acceso global. Resto: viewer (sus permisos vienen de liga/equipo).
  update public.profiles set global_role = 'super_admin', full_name = coalesce(full_name, 'Super Admin'), updated_at = now() where id = v_superadmin_id;
  update public.profiles set global_role = 'viewer', full_name = coalesce(full_name, 'League Admin'), updated_at = now() where id = v_leagueadmin_id;
  update public.profiles set global_role = 'viewer', full_name = coalesce(full_name, 'Team Admin'), updated_at = now() where id = v_teamadmin_id;
  update public.profiles set global_role = 'viewer', full_name = coalesce(full_name, 'Coach Prueba'), updated_at = now() where id = v_coach_id;
  update public.profiles set global_role = 'viewer', full_name = coalesce(full_name, 'Referee Prueba'), updated_at = now() where id = v_referee_id;
  update public.profiles set global_role = 'viewer', full_name = coalesce(full_name, 'Viewer Prueba'), updated_at = now() where id = v_viewer_id;

  -- ---------- 2. LEAGUE_MEMBERS (ambas ligas) ---------- --
  -- league_admin en ambas
  insert into public.league_members (league_id, profile_id, role)
  values (v_liga_fuerza, v_leagueadmin_id, 'league_admin'), (v_liga_a, v_leagueadmin_id, 'league_admin')
  on conflict (league_id, profile_id) do update set role = excluded.role, updated_at = now();

  -- team_admin / coach / referee necesitan membresía de liga para leer la liga (can_access_league).
  -- Se les da su rol operativo a nivel liga + rol fino a nivel equipo/partido abajo.
  insert into public.league_members (league_id, profile_id, role)
  values
    (v_liga_fuerza, v_teamadmin_id, 'team_admin'), (v_liga_a, v_teamadmin_id, 'team_admin'),
    (v_liga_fuerza, v_coach_id, 'coach'),         (v_liga_a, v_coach_id, 'coach'),
    (v_liga_fuerza, v_referee_id, 'referee'),     (v_liga_a, v_referee_id, 'referee'),
    (v_liga_fuerza, v_viewer_id, 'viewer'),       (v_liga_a, v_viewer_id, 'viewer')
  on conflict (league_id, profile_id) do update set role = excluded.role, updated_at = now();

  -- super_admin no necesita league_members (is_super_admin bypassa todo), pero se agrega como viewer
  -- para que aparezca en listados de miembros si quieres verlo.
  insert into public.league_members (league_id, profile_id, role)
  values (v_liga_fuerza, v_superadmin_id, 'viewer'), (v_liga_a, v_superadmin_id, 'viewer')
  on conflict (league_id, profile_id) do nothing;

  -- ---------- 3. TEAM_MEMBERS (Molinos en ambas ligas) ---------- --
  insert into public.team_members (team_id, profile_id, role)
  values
    (v_molinos_fuerza, v_teamadmin_id, 'team_admin'),
    (v_molinos_a,      v_teamadmin_id, 'team_admin'),
    (v_molinos_fuerza, v_coach_id, 'coach'),
    (v_molinos_a,      v_coach_id, 'coach')
  on conflict (team_id, profile_id) do update set role = excluded.role, updated_at = now();

  -- ---------- 4. PARTIDO ASIGNADO AL REFEREE (uno por liga) ---------- --
  -- Se elige el próximo partido scheduled de cada liga y se asigna como central.
  select id into v_match_fuerza from public.matches where league_id = v_liga_fuerza and status = 'scheduled' order by scheduled_at asc limit 1;
  select id into v_match_a      from public.matches where league_id = v_liga_a and status = 'scheduled' order by scheduled_at asc limit 1;

  if v_match_fuerza is not null then
    update public.matches set referee_id = v_referee_id, updated_at = now() where id = v_match_fuerza;
    insert into public.match_officials (match_id, profile_id, role)
    values (v_match_fuerza, v_referee_id, 'head_referee')
    on conflict do nothing;
  end if;

  if v_match_a is not null then
    update public.matches set referee_id = v_referee_id, updated_at = now() where id = v_match_a;
    insert into public.match_officials (match_id, profile_id, role)
    values (v_match_a, v_referee_id, 'head_referee')
    on conflict do nothing;
  end if;

  raise notice 'OK · super_admin=% league_admin=% team_admin=% coach=% referee=% viewer=%', v_superadmin_id, v_leagueadmin_id, v_teamadmin_id, v_coach_id, v_referee_id, v_viewer_id;
  raise notice 'Liga Fuerza=% Liga A=% MolinosFuerza=% MolinosA=% MatchFuerza=% MatchA=%', v_liga_fuerza, v_liga_a, v_molinos_fuerza, v_molinos_a, v_match_fuerza, v_match_a;
end $$;

-- ---------- VERIFICACIÓN (corre esto después) ---------- --
-- select u.email, p.full_name, p.global_role
-- from auth.users u join public.profiles p on p.id = u.id
-- where u.email in ('superadmin@futpromanager.com','leagueadmin@futpromanager.com','teamadmin@futpromanager.com','coach@futpromanager.com','referee@futpromanager.com','viewer@futpromanager.com')
-- order by u.email;
--
-- select l.slug as liga, u.email, lm.role as league_role
-- from public.league_members lm
-- join auth.users u on u.id = lm.profile_id
-- join public.leagues l on l.id = lm.league_id
-- order by l.slug, u.email;
--
-- select l.slug as liga, t.slug as equipo, u.email, tm.role as team_role
-- from public.team_members tm
-- join auth.users u on u.id = tm.profile_id
-- join public.teams t on t.id = tm.team_id
-- join public.leagues l on l.id = t.league_id
-- order by l.slug, t.slug, u.email;
