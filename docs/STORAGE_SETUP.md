# Storage Setup (Media Uploads MVP)

Fecha: 2026-05-19

Este documento describe el setup operativo de Supabase Storage para que Media Uploads MVP funcione end-to-end.

## Setup real verificado

- Fecha: 2026-05-19
- Proyecto Supabase: `wyntbcsgnbpznimcixqb`
- URL del proyecto: `https://wyntbcsgnbpznimcixqb.supabase.co`
- Bucket `league-media`: creado/verificado.
- Bucket público: `true`.
- Policy `Public read league media`: creada/verificada para `SELECT` con rol `public`.
- Policy `Authenticated upload league media`: creada/verificada para `INSERT` con rol `authenticated`.
- Condición de upload: `bucket_id = 'league-media'` y `name like 'leagues/%'`.
- Smoke test físico por Storage API: no ejecutado porque no hay sesión de usuario autenticado de la app disponible en este entorno.
- Validación segura ejecutada: lectura como `anon` sin error e inserción como `authenticated` bajo `leagues/storage-smoke-test/test.txt` dentro de transacción revertida. No quedaron objetos de prueba persistidos.

## Bucket requerido

- Nombre: `league-media`
- Tipo recomendado: **público** (si la app usa `getPublicUrl`).

## Entidades soportadas

- Logo de liga.
- Logo de equipo.
- Foto de jugador.

## Estructura de paths

- `leagues/{leagueId}/league/logo/{timestamp}-{safeFileName}`
- `leagues/{leagueId}/teams/{teamId}/logo/{timestamp}-{safeFileName}`
- `leagues/{leagueId}/players/{playerId}/photo/{timestamp}-{safeFileName}`

## Límites y MIME

- Logos: máximo `2 MB`. MIME permitidos: `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`.
- Foto de jugador: máximo `3 MB`. MIME permitidos: `image/jpeg`, `image/png`, `image/webp`.

## Notas de seguridad

- Validar permisos de negocio en server actions antes de subir archivo.
- No usar `SUPABASE_SERVICE_ROLE_KEY` en este flujo.
- No exponer controles de upload en rutas públicas.
- No confiar solo en validación de cliente (`accept`); mantener validación server-side de MIME/tamaño.
- Revisar y probar RLS/policies de Storage en cada entorno (local/staging/prod).

## Setup manual en Supabase Dashboard

1. Ir a `Storage -> Buckets`.
2. Crear bucket `league-media`.
3. Activar `Public bucket` si se servirán imágenes con URL pública.
4. Ir a `Storage -> Policies` y configurar reglas para:
   - lectura pública de objetos del bucket (si se usa público),
   - upload solo para usuarios autenticados,
   - restricción de paths permitidos bajo `leagues/{leagueId}/...` cuando sea viable en tu proyecto.

## Ejemplo orientativo de policies

Importante:
- Este SQL es **orientativo** y requiere revisión manual.
- No se ejecuta automáticamente desde este repo.
- Las policies exactas pueden variar según la configuración de tu proyecto Supabase.

```sql
-- Lectura pública del bucket (solo si usarás URLs públicas)
create policy "Public read league media"
on storage.objects
for select
to public
using (bucket_id = 'league-media');

-- Upload por usuarios autenticados a prefijo leagues/
create policy "Authenticated upload league media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'league-media'
  and name like 'leagues/%'
);
```

Si no puedes garantizar una policy SQL segura por limitaciones del esquema actual, usa el setup manual en Dashboard y valida el flujo real con el checklist de `docs/QA_MEDIA_UPLOADS.md`.
