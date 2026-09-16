-- Administracion de cuentas para super_admin:
-- 1) Columna is_suspended en profiles (suspension/baneo de acceso al dashboard).
-- 2) RPCs security definer para operaciones sensibles con guardrails y auditoria.
--    Los RPCs validan super_admin internamente; el trigger anti-escalamiento
--    (ensure_profile_role_protection) no aplica porque son SECURITY DEFINER
--    con auth.uid() del super_admin invocante verificado explicitamente.

-- 1) Suspension de usuarios -------------------------------------------------
alter table public.profiles
  add column if not exists is_suspended boolean not null default false;

-- El propio super_admin no puede suspenderse a si mismo (guardrail en RPC),
-- y el super_admin activo debe poder seguir leyendo perfiles: la politica
-- existente profiles_select_own_or_super_admin ya cubre la lectura.

-- 2) RPC: asignar rol super_admin (la operacion mas sensible) ---------------
-- Guardrails: solo un super_admin puede invocar; no auto-asignacion; objetivo
-- debe existir; no puede ser un usuario suspendido. Doble auditoria.
create or replace function public.admin_assign_super_admin(p_target_user_id uuid)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_is_super boolean;
  v_current_super_count int;
  v_target_role public.app_role;
  v_target_suspended boolean;
begin
  select public.is_super_admin() into v_is_super;
  if not v_is_super then
    raise exception 'Solo super_admin puede asignar el rol super_admin' using errcode = '42501';
  end if;

  if p_target_user_id is null or p_target_user_id = auth.uid() then
    raise exception 'No puedes asignarte el rol super_admin a ti mismo';
  end if;

  if not exists (select 1 from public.profiles where id = p_target_user_id) then
    raise exception 'El usuario objetivo no existe';
  end if;

  select global_role, is_suspended into v_target_role, v_target_suspended
  from public.profiles where id = p_target_user_id;

  if v_target_role = 'super_admin' then
    return 'already';
  end if;

  if v_target_suspended then
    raise exception 'No puedes asignar super_admin a un usuario suspendido';
  end if;

  -- El trigger ensure_profile_role_protection permite el cambio cuando el actor
  -- es super_admin; aqui ademas forzamos escritura por el definer.
  update public.profiles
  set global_role = 'super_admin'
  where id = p_target_user_id;

  insert into public.audit_logs (actor_id, league_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    null,
    'user.super_admin_assigned',
    'profile',
    p_target_user_id,
    jsonb_build_object('previous_role', v_target_role)
  );

  return 'assigned';
end;
$$;

revoke all on function public.admin_assign_super_admin(uuid) from public, anon;
grant execute on function public.admin_assign_super_admin(uuid) to authenticated;

-- 3) RPC: cambiar global_role de un usuario (roles no super_admin) ----------
-- No permite asignar ni quitar super_admin (eso va por admin_assign_super_admin
-- y por SQL administrativo para remover); evita que un super_admin se degrade
-- a si mismo accidentalmente.
create or replace function public.admin_set_global_role(p_target_user_id uuid, p_new_role public.app_role)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_is_super boolean;
  v_previous_role public.app_role;
  v_is_self boolean;
begin
  select public.is_super_admin() into v_is_super;
  if not v_is_super then
    raise exception 'Solo super_admin puede cambiar roles globales' using errcode = '42501';
  end if;

  if p_new_role = 'super_admin' then
    raise exception 'Usa admin_assign_super_admin para asignar super_admin';
  end if;

  if p_target_user_id is null then
    raise exception 'Usuario objetivo requerido';
  end if;

  v_is_self := p_target_user_id = auth.uid();

  select global_role into v_previous_role
  from public.profiles where id = p_target_user_id;

  if v_previous_role is null then
    raise exception 'El usuario objetivo no existe';
  end if;

  if v_previous_role = 'super_admin' then
    raise exception 'No puedes cambiar el rol de otro super_admin desde aqui';
  end if;

  -- Guardrail: un super_admin no puede degradarse a si mismo si es el ultimo.
  if v_is_self then
    declare
      v_super_count int;
    begin
      select count(*) into v_super_count from public.profiles where global_role = 'super_admin';
      if v_super_count <= 1 then
        raise exception 'Eres el unico super_admin; no puedes degradarte';
      end if;
    end;
  end if;

  if v_previous_role = p_new_role then
    return 'unchanged';
  end if;

  update public.profiles
  set global_role = p_new_role
  where id = p_target_user_id;

  insert into public.audit_logs (actor_id, league_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    null,
    'user.global_role_updated',
    'profile',
    p_target_user_id,
    jsonb_build_object('previous_role', v_previous_role, 'new_role', p_new_role)
  );

  return 'updated';
end;
$$;

revoke all on function public.admin_set_global_role(uuid, public.app_role) from public, anon;
grant execute on function public.admin_set_global_role(uuid, public.app_role) to authenticated;

-- 4) RPC: suspender / rehabilitar un usuario --------------------------------
create or replace function public.admin_set_user_suspension(p_target_user_id uuid, p_suspended boolean)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_is_super boolean;
  v_previous boolean;
begin
  select public.is_super_admin() into v_is_super;
  if not v_is_super then
    raise exception 'Solo super_admin puede suspender usuarios' using errcode = '42501';
  end if;

  if p_target_user_id is null then
    raise exception 'Usuario objetivo requerido';
  end if;

  if p_target_user_id = auth.uid() then
    raise exception 'No puedes suspender tu propia cuenta';
  end if;

  if not exists (select 1 from public.profiles where id = p_target_user_id) then
    raise exception 'El usuario objetivo no existe';
  end if;

  select is_suspended into v_previous from public.profiles where id = p_target_user_id;

  if v_previous = p_suspended then
    return 'unchanged';
  end if;

  -- Guardrail: no dejar la plataforma sin ningun super_admin activo.
  if p_suspended then
    declare
      v_target_is_super boolean;
      v_active_super_count int;
    begin
      select global_role = 'super_admin' into v_target_is_super from public.profiles where id = p_target_user_id;
      if v_target_is_super then
        select count(*) into v_active_super_count
        from public.profiles
        where global_role = 'super_admin' and not is_suspended;
        if v_active_super_count <= 1 then
          raise exception 'No puedes suspender al unico super_admin activo';
        end if;
      end if;
    end;
  end if;

  update public.profiles
  set is_suspended = p_suspended
  where id = p_target_user_id;

  insert into public.audit_logs (actor_id, league_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    null,
    case when p_suspended then 'user.suspended' else 'user.reinstated' end,
    'profile',
    p_target_user_id,
    jsonb_build_object('previous_state', v_previous, 'new_state', p_suspended)
  );

  return case when p_suspended then 'suspended' else 'reinstated' end;
end;
$$;

revoke all on function public.admin_set_user_suspension(uuid, boolean) from public, anon;
grant execute on function public.admin_set_user_suspension(uuid, boolean) to authenticated;

-- 5) Vista del listado: exponer is_suspended tambien en admin_list_users ----
create or replace function public.admin_list_users(
  p_role public.app_role default null,
  p_search text default null,
  p_limit int default 200,
  p_offset int default 0,
  p_suspended boolean default null
)
returns table (
  id uuid,
  email text,
  full_name text,
  display_name text,
  avatar_url text,
  phone text,
  global_role public.app_role,
  is_suspended boolean,
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
    p.is_suspended,
    p.created_at,
    u.last_sign_in_at,
    coalesce(m.total, 0)
  from public.profiles p
  join auth.users u on u.id = p.id
  left join memberships m on m.profile_id = p.id
  where (p_role is null or p.global_role = p_role)
    and (p_suspended is null or p.is_suspended = p_suspended)
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

revoke all on function public.admin_list_users(public.app_role, text, int, int, boolean) from public, anon;
grant execute on function public.admin_list_users(public.app_role, text, int, int, boolean) to authenticated;
