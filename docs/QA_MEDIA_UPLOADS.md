# QA Media Uploads MVP

Fecha: 2026-05-19

## Alcance
- Upload de logo de liga, logo de equipo y foto de jugador con bucket `league-media`.
- Validación server-side de MIME/tamaño.
- Registro de metadata en `media_uploads` y auditoría best-effort.

## Checklist
- [x] Usuario sin permiso no ve controles (condicional por `canManageLeague`/`canManageCatalog`).
- [x] Usuario autorizado ve formulario de upload.
- [x] Archivo vacío se rechaza.
- [x] MIME inválido se rechaza.
- [x] Archivo excedido se rechaza.
- [x] Actualiza `leagues.logo_url`.
- [x] Actualiza `teams.logo_url`.
- [x] Actualiza `players.photo_url`.
- [x] Inserta metadata en `media_uploads` (si RLS/policies permiten insert).
- [x] Genera audit logs media.* (si RLS permite insert en audit_logs).
- [x] Si bucket/policies faltan, devuelve: “No se pudo subir el archivo. Verifica la configuración de Storage.”
- [x] Vistas públicas no rompen sin imagen.
- [x] No se tocaron migraciones/schema/RLS.

## Setup manual requerido
- Crear bucket `league-media` en Supabase Storage.
- Configurar políticas de Storage compatibles con usuarios autenticados autorizados.
- Mantener RLS de `media_uploads` permitiendo inserts a actores autorizados.

## Pendientes post-MVP
- Borrado físico y cleanup de huérfanos.
- Reemplazo con rollback transaccional robusto.
- Crop/resize y optimización avanzada.
- Múltiples imágenes por entidad.
- Avatar de perfil.
- CDN/custom domain.
