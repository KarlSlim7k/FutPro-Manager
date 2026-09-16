-- Migración: Storage league-media hardening (fix HIGH-1/HIGH-2)
-- Reemplaza policies wildcard UPDATE/DELETE que permitían a cualquier
-- usuario autenticado sobrescribir/borrar media de cualquier liga.

-- Helper seguro: extrae league_id del path leagues/<uuid>/... y verifica can_manage_league.
-- Retorna false para paths no-UUID (ej. leagues/avatars/...) o sin sesión.
create or replace function public.is_league_media_manager(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public, storage
as $$
declare
  parts text[];
  candidate text;
  league_uuid uuid;
begin
  if object_name is null or auth.uid() is null then
    return false;
  end if;
  if public.is_super_admin() then
    return true;
  end if;
  parts := storage.foldername(object_name);
  -- foldername('leagues/<uuid>/league/logo/x.png') => {leagues,<uuid>,league,logo}
  if parts is null or array_length(parts, 1) is null or array_length(parts, 1) < 2 then
    return false;
  end if;
  if parts[1] <> 'leagues' then
    return false;
  end if;
  candidate := parts[2];
  if candidate is null or candidate !~ '^[0-9a-fA-F-]{36}$' then
    return false;
  end if;
  begin
    league_uuid := candidate::uuid;
  exception when others then
    return false;
  end;
  return public.can_manage_league(league_uuid);
end;
$$;

drop policy if exists "Authenticated update league media" on storage.objects;
drop policy if exists "Authenticated delete league media" on storage.objects;

-- UPDATE: solo owner del objeto, manager de la liga del path, o super_admin.
create policy "League media update restricted"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'league-media'
  and (
    owner = auth.uid()
    or public.is_super_admin()
    or public.is_league_media_manager(name)
  )
)
with check (
  bucket_id = 'league-media'
  and (
    owner = auth.uid()
    or public.is_super_admin()
    or public.is_league_media_manager(name)
  )
);

-- DELETE: mismo criterio restrictivo.
create policy "League media delete restricted"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'league-media'
  and (
    owner = auth.uid()
    or public.is_super_admin()
    or public.is_league_media_manager(name)
  )
);
