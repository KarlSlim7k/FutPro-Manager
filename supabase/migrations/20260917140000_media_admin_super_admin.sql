-- Administracion de storage para super_admin (modulo de valor medio).
-- El objeto de storage no permite lecturas arbitrarias via SQL; este RPC
-- security definer usa las APIs de storage internas (storage.objects) solo
-- para LISTADO de metadatos, y el borrado se hace con delete de storage.objects
-- tambien via definer. Todo queda auditado.

-- 1) RPC: listar objetos de un bucket con filtros (solo super_admin).
create or replace function public.admin_list_storage_objects(
  p_bucket text,
  p_search text default null,
  p_limit int default 200
)
returns table (
  id uuid,
  name text,
  bucket_id text,
  size_bytes bigint,
  mime_type text,
  created_at timestamptz,
  updated_at timestamptz,
  owner_id uuid
)
language sql
stable
security definer
set search_path = public, storage
as $$
  select
    o.id,
    o.name,
    o.bucket_id,
    coalesce(o.metadata->>'size', '0')::bigint,
    o.metadata->>'mimetype',
    o.created_at,
    o.updated_at,
    o.owner
  from storage.objects o
  where o.bucket_id = p_bucket
    and public.is_super_admin()
    and (
      p_search is null
      or p_search = ''
      or o.name ilike '%' || p_search || '%'
    )
  order by o.created_at desc
  limit least(coalesce(p_limit, 200), 500);
$$;

revoke all on function public.admin_list_storage_objects(text, text, int) from public, anon;
grant execute on function public.admin_list_storage_objects(text, text, int) to authenticated;

-- 2) RPC: borrar un objeto de storage (solo super_admin), auditado.
create or replace function public.admin_delete_storage_object(p_object_id uuid)
returns int
language plpgsql
volatile
security definer
set search_path = public, storage
as $$
declare
  v_is_super boolean;
  v_bucket text;
  v_name text;
  v_deleted int;
begin
  select public.is_super_admin() into v_is_super;
  if not v_is_super then
    raise exception 'Solo super_admin puede borrar objetos de storage' using errcode = '42501';
  end if;

  select bucket_id, name into v_bucket, v_name
  from storage.objects
  where id = p_object_id;

  if v_bucket is null then
    raise exception 'Objeto no encontrado';
  end if;

  delete from storage.objects where id = p_object_id;
  get diagnostics v_deleted = row_count;

  insert into public.audit_logs (actor_id, league_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    null,
    'storage.object_deleted',
    'storage_object',
    p_object_id,
    jsonb_build_object('bucket', v_bucket, 'name', v_name)
  );

  return v_deleted;
end;
$$;

revoke all on function public.admin_delete_storage_object(uuid) from public, anon;
grant execute on function public.admin_delete_storage_object(uuid) to authenticated;

-- 3) RPC: estadisticas de storage por bucket (solo super_admin).
create or replace function public.admin_storage_stats()
returns table (
  bucket_id text,
  object_count bigint,
  total_bytes bigint
)
language sql
stable
security definer
set search_path = public, storage
as $$
  select
    o.bucket_id,
    count(*)::bigint,
    coalesce(sum(coalesce(o.metadata->>'size', '0')::bigint), 0)::bigint
  from storage.objects o
  where public.is_super_admin()
  group by o.bucket_id
  order by o.bucket_id;
$$;

revoke all on function public.admin_storage_stats() from public, anon;
grant execute on function public.admin_storage_stats() to authenticated;
