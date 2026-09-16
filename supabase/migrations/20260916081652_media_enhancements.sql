-- Migración: Media Enhancements (Soporte de avatares, media global y policies Storage)
-- Fecha: 2026-09-16
-- Descripción:
-- 1. Permite league_id nulo en public.media_uploads para avatares de perfil y media global.
-- 2. Actualiza políticas RLS en public.media_uploads para permitir gestión de media propia global y ligada a ligas.
-- 3. Habilita políticas de UPDATE y DELETE en storage.objects para el bucket 'league-media'.

-- 1. Permitir que league_id sea nulo en media_uploads (ej. avatares de usuario / media global)
alter table public.media_uploads alter column league_id drop not null;

-- 2. Actualizar políticas RLS de media_uploads
drop policy if exists "media_uploads_member_read" on public.media_uploads;
drop policy if exists "media_uploads_insert_member" on public.media_uploads;
drop policy if exists "media_uploads_update_owner_or_league_admin" on public.media_uploads;
drop policy if exists "media_uploads_delete_owner_or_league_admin" on public.media_uploads;
drop policy if exists "media_uploads_select" on public.media_uploads;
drop policy if exists "media_uploads_insert" on public.media_uploads;
drop policy if exists "media_uploads_update" on public.media_uploads;
drop policy if exists "media_uploads_delete" on public.media_uploads;

create policy "media_uploads_select"
on public.media_uploads
for select
to authenticated
using (
  uploaded_by = auth.uid()
  or (league_id is not null and public.can_access_league(league_id))
  or public.is_super_admin()
);

create policy "media_uploads_insert"
on public.media_uploads
for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and (league_id is null or public.can_access_league(league_id) or public.is_super_admin())
);

create policy "media_uploads_update"
on public.media_uploads
for update
to authenticated
using (
  uploaded_by = auth.uid()
  or (league_id is not null and public.can_manage_league(league_id))
  or public.is_super_admin()
)
with check (
  uploaded_by = auth.uid()
  or (league_id is not null and public.can_manage_league(league_id))
  or public.is_super_admin()
);

create policy "media_uploads_delete"
on public.media_uploads
for delete
to authenticated
using (
  uploaded_by = auth.uid()
  or (league_id is not null and public.can_manage_league(league_id))
  or public.is_super_admin()
);

-- 3. Políticas de Storage para update y delete en league-media
drop policy if exists "Authenticated update league media" on storage.objects;
drop policy if exists "Authenticated delete league media" on storage.objects;

create policy "Authenticated update league media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'league-media'
  and (owner = auth.uid() or name like 'leagues/%')
)
with check (
  bucket_id = 'league-media'
  and (owner = auth.uid() or name like 'leagues/%')
);

create policy "Authenticated delete league media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'league-media'
  and (owner = auth.uid() or name like 'leagues/%')
);
