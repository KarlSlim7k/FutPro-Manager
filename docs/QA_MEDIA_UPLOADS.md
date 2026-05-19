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
- [x] Usuario `league_admin` puede subir logo de liga.
- [x] Usuario `league_admin` puede subir logo de equipo.
- [x] Usuario `league_admin` puede subir foto de jugador.
- [ ] Usuario sin permiso no ve controles.
- [ ] SVG permitido para logos.
- [x] SVG rechazado/no sugerido para foto de jugador.
- [x] MIME inválido rechazado para foto de jugador.
- [x] Archivo excedido rechazado de forma controlada para foto de jugador.
- [x] Metadata aparece en `media_uploads`.
- [x] Audit logs aparecen en auditoría.
- [x] Vistas públicas de liga/equipo muestran imágenes subidas sin sesión.
- [x] URLs públicas de liga/equipo/jugador responden `HTTP 200` con `content-type: image/png`.
- [ ] Vista pública de jugador sin sesión queda pendiente por RLS actual de `public.players` (solo permite `SELECT` a `authenticated`).
- [ ] Error controlado cuando bucket/policy falta.

## Smoke test Storage
- Smoke test físico por Storage API no ejecutado porque este entorno no tiene una sesión de usuario autenticado de la app para probar el flujo real sin usar `service_role`.
- No se dejaron objetos de prueba persistidos en `league-media`.

## QA real con usuario dedicado
- Fecha: 2026-05-19.
- Proyecto Supabase: `wyntbcsgnbpznimcixqb`.
- Usuario QA: `qa.codex.futpro@gmail.com`.
- `profiles.global_role`: `viewer`.
- Rol de liga: `league_admin` solo en `liga-qa-codex`.
- Liga QA: `Liga QA Codex` (`liga-qa-codex`).
- Equipo QA: `Equipo QA Codex` (`equipo-qa-codex`).
- Jugador QA: `Jugador QA Codex`.
- Login real validado por Auth y UI local.
- Uploads reales desde la app:
  - logo de liga: exitoso;
  - logo de equipo: exitoso;
  - foto de jugador: exitoso.
- Verificación de base de datos:
  - `leagues.logo_url`, `teams.logo_url` y `players.photo_url` actualizados;
  - registros en `media_uploads` para `league`, `team` y `player`;
  - audit logs `media.league_logo_updated`, `media.team_logo_updated`, `media.player_photo_updated`.
- Ajuste aplicado durante QA:
  - `next.config.js` ahora configura `experimental.serverActions.bodySizeLimit = "4mb"` para que las validaciones propias de 2 MB/3 MB respondan con errores controlados y no con el límite default de 1 MB de Next.js.
- Objetos persistidos:
  - quedaron 6 objetos de prueba en `league-media` bajo `leagues/ed40be3c-0171-4ba9-9a67-d28f3d6b1c4b/...` por dos corridas positivas de QA;
  - se dejaron intencionalmente para preservar evidencia y no borrar archivos existentes.
- Credenciales:
  - password temporal no documentado ni versionado;
  - valores de QA usados desde `/tmp/futpro-qa-env` con permisos locales restrictivos.
- Pendiente operativo:
  - rotar o eliminar la cuenta QA cuando termine el ciclo de pruebas;
  - decidir si se habilita lectura pública de `players` o un mecanismo específico para `/liga/[slug]/players/[playerId]` sin romper los guardrails de RLS.

## Pendientes post-MVP
- Borrado físico y cleanup de huérfanos.
- Reemplazo con rollback transaccional robusto.
- Crop/resize y optimización avanzada.
- Múltiples imágenes por entidad.
- Avatar de perfil.
- CDN/custom domain.
