-- Admin RPCs y lecturas para super_admin (modulo de administracion de plataforma).
-- Todo es read-only salvo las purgas, que quedan auditadas en audit_logs.

-- 1) Politica SELECT de contact_messages para super_admin.
--    La migracion original solo permitia lecturas via service_role; esto habilita
--    la bandeja /dashboard/contact-messages con el cliente autenticado.
drop policy if exists "contact_messages_select_super_admin" on public.contact_messages;
create policy "contact_messages_select_super_admin"
  on public.contact_messages
  for select
  to authenticated
  using (public.is_super_admin());

-- 2) RPC: listado de usuarios con email (auth.users) y conteo de membresias.
--    SECURITY DEFINER porque auth.users no es legible para authenticated.
--    Solo super_admin puede invocarla; devuelve un maximo de 500 filas.
create or replace function public.admin_list_users(
  p_role public.app_role default null,
  p_search text default null,
  p_limit int default 200,
  p_offset int default 0
)
returns table (
  id uuid,
  email text,
  full_name text,
  display_name text,
  avatar_url text,
  phone text,
  global_role public.app_role,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  league_memberships int
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_is_super boolean;
begin
  select public.is_super_admin() into v_is_super;
  if not v_is_super then
    raise exception 'Solo super_admin puede listar usuarios' using errcode = '42501';
  end if;

  return query
  with memberships as (
    select lm.profile_id, count(*)::int as total
    from public.league_members lm
    group by lm.profile_id
  )
  select
    p.id,
    u.email,
    p.full_name,
    p.display_name,
    p.avatar_url,
    p.phone,
    p.global_role,
    p.created_at,
    u.last_sign_in_at,
    coalesce(m.total, 0)
  from public.profiles p
  join auth.users u on u.id = p.id
  left join memberships m on m.profile_id = p.id
  where (p_role is null or p.global_role = p_role)
    and (
      p_search is null
      or p_search = ''
      or coalesce(p.full_name, '') ilike '%' || p_search || '%'
      or coalesce(p.display_name, '') ilike '%' || p_search || '%'
      or coalesce(u.email, '') ilike '%' || p_search || '%'
      or coalesce(p.phone, '') ilike '%' || p_search || '%'
    )
  order by p.created_at desc
  limit least(coalesce(p_limit, 200), 500)
  offset greatest(coalesce(p_offset, 0), 0);
end;
$$;

revoke all on function public.admin_list_users(public.app_role, text, int, int) from public, anon;
grant execute on function public.admin_list_users(public.app_role, text, int, int) to authenticated;

-- 3) RPC: estadisticas de tamano/retencion de auditoria para super_admin.
create or replace function public.admin_audit_stats()
returns table (
  total_logs bigint,
  older_than_90_days bigint,
  older_than_180_days bigint,
  older_than_365_days bigint,
  oldest_log_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*)::bigint,
    count(*) filter (where created_at < now() - interval '90 days')::bigint,
    count(*) filter (where created_at < now() - interval '180 days')::bigint,
    count(*) filter (where created_at < now() - interval '365 days')::bigint,
    min(created_at)
  from public.audit_logs
  where public.is_super_admin();
$$;

revoke all on function public.admin_audit_stats() from public, anon;
grant execute on function public.admin_audit_stats() to authenticated;

-- 4) RPC: purga global de auditoria por retencion (solo super_admin).
--    Registra la operacion en audit_logs (league_id null, ambito global).
create or replace function public.admin_purge_audit_logs(p_days int)
returns int
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_is_super boolean;
  v_cutoff timestamptz;
  v_deleted int;
begin
  select public.is_super_admin() into v_is_super;
  if not v_is_super then
    raise exception 'Solo super_admin puede purgar la auditoria' using errcode = '42501';
  end if;

  if p_days not in (90, 180, 365) then
    raise exception 'Retencion invalida: usar 90, 180 o 365 dias';
  end if;

  v_cutoff := now() - make_interval(days => p_days);

  delete from public.audit_logs
  where created_at < v_cutoff
    and league_id is not null; -- no toca logs globales (league_id null)

  get diagnostics v_deleted = row_count;

  insert into public.audit_logs (actor_id, league_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    null,
    'audit.purged',
    'global',
    null,
    jsonb_build_object('days', p_days, 'deleted_count', v_deleted, 'scope', 'global')
  );

  return v_deleted;
end;
$$;

revoke all on function public.admin_purge_audit_logs(int) from public, anon;
grant execute on function public.admin_purge_audit_logs(int) to authenticated;

-- 5) RPC: conteo de mensajes de contacto y purga de antiguos (solo super_admin).
create or replace function public.admin_contact_message_stats()
returns table (
  total bigint,
  last_30_days bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*)::bigint,
    count(*) filter (where created_at >= now() - interval '30 days')::bigint
  from public.contact_messages
  where public.is_super_admin();
$$;

revoke all on function public.admin_contact_message_stats() from public, anon;
grant execute on function public.admin_contact_message_stats() to authenticated;

create or replace function public.admin_purge_contact_messages(p_days int)
returns int
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_is_super boolean;
  v_deleted int;
begin
  select public.is_super_admin() into v_is_super;
  if not v_is_super then
    raise exception 'Solo super_admin puede purgar mensajes' using errcode = '42501';
  end if;

  if p_days not in (90, 180, 365) then
    raise exception 'Retencion invalida: usar 90, 180 o 365 dias';
  end if;

  delete from public.contact_messages
  where created_at < now() - make_interval(days => p_days);

  get diagnostics v_deleted = row_count;

  insert into public.audit_logs (actor_id, league_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    null,
    'contact_messages.purged',
    'contact_message',
    null,
    jsonb_build_object('days', p_days, 'deleted_count', v_deleted)
  );

  return v_deleted;
end;
$$;

revoke all on function public.admin_purge_contact_messages(int) from public, anon;
grant execute on function public.admin_purge_contact_messages(int) to authenticated;
