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
- Bucket `league-media` creado/verificado en Supabase Storage (2026-05-19).
- Bucket público verificado (`public = true`) porque la app usa `getPublicUrl`.
- Policies de Storage creadas/verificadas:
  - `Public read league media`: `SELECT` para `public` con `bucket_id = 'league-media'`.
  - `Authenticated upload league media`: `INSERT` para `authenticated` con `bucket_id = 'league-media'` y `name like 'leagues/%'`.
- Mantener RLS de `media_uploads` permitiendo inserts a actores autorizados.

## QA operativo pendiente / real
- [x] Bucket `league-media` existe.
- [x] Bucket es público o la app usa URLs públicas compatibles.
- [x] Policy de lectura pública existe para `league-media`.
- [x] Policy de insert autenticado existe bajo `leagues/%`.
- [x] Validación segura sin persistencia: `anon` puede leer sin error y `authenticated` puede insertar bajo `leagues/%` dentro de transacción revertida.
- [ ] Usuario `league_admin` puede subir logo de liga.
- [ ] Usuario `league_admin` puede subir logo de equipo.
- [ ] Usuario `league_admin` puede subir foto de jugador.
- [ ] Usuario sin permiso no ve controles.
- [ ] SVG permitido para logos.
- [ ] SVG rechazado/no sugerido para foto de jugador.
- [ ] Metadata aparece en `media_uploads`.
- [ ] Audit logs aparecen en auditoría.
- [ ] Vistas públicas muestran imagen o fallback.
- [ ] Error controlado cuando bucket/policy falta.

## Smoke test Storage
- Smoke test físico por Storage API no ejecutado porque este entorno no tiene una sesión de usuario autenticado de la app para probar el flujo real sin usar `service_role`.
- No se dejaron objetos de prueba persistidos en `league-media`.

## Pendientes post-MVP
- Borrado físico y cleanup de huérfanos.
- Reemplazo con rollback transaccional robusto.
- Crop/resize y optimización avanzada.
- Múltiples imágenes por entidad.
- Avatar de perfil.
- CDN/custom domain.
