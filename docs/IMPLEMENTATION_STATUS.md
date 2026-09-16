# Implementation Status

## Resumen ejecutivo

El MVP de FutPro Manager ya cuenta con autenticación, rutas protegidas de dashboard y varios módulos operativos para gestión deportiva (ligas, temporadas, equipos, jugadores, sedes, partidos, resultados y eventos). También existe una vista de tabla de posiciones que consume datos reales de Supabase.

Estado actual del MVP:

- **Funcionando**: login, protección de rutas, navegación de dashboard, CRUD base de ligas/temporadas/equipos/jugadores/sedes/partidos, captura de resultado y eventos, y consulta de standings.
- **Funcionando**: standings con hardening MVP (recálculo manual + automático, auditoría best-effort de recálculos, warnings controlados por inconsistencias y revalidación dashboard/pública).
- **Falta para MVP operativo completo**: robustecer automatización avanzada de standings (eventos/auditoría/jobs), robustecer roles avanzados en UI y cobertura de QA end-to-end.
- **Solo en base técnica (schema/RLS)**: suscripciones/pagos con tablas/políticas existentes pero sin flujo UI/negocio completo.
- **Implementado con setup operativo externo verificado**: media uploads MVP (`league-media` y policies de Supabase Storage configuradas en el proyecto `wyntbcsgnbpznimcixqb`).

## Leyenda de estado

- **Implementado**: existe ruta/UI/flujo funcional verificable en repo.
- **Parcial**: existe implementación útil, pero faltan piezas clave para cerrar el módulo.
- **Pendiente**: módulo planeado sin flujo funcional real.
- **Base técnica existente**: existe en schema/RLS/tipos, sin implementación funcional completa en app.
- **No iniciado**: no hay evidencia funcional ni base técnica suficiente.

## Estado por módulo

### Autenticación
- **Estado:** Implementado.
- **Evidencia en repo:** `app/login/page.tsx`, `components/auth/login-form.tsx`, `app/dashboard/layout.tsx`, `proxy.ts`, `lib/supabase/server.ts`.
- **Funcionalidad existente:** login/registro con Supabase Auth, protección de rutas dashboard y redirecciones por sesión.
- **Pendiente:** endurecer pruebas E2E de sesión y expiración.

### Dashboard
- **Estado:** Implementado.
- **Evidencia en repo:** `app/dashboard/page.tsx`, `components/dashboard/header.tsx`, `components/dashboard/sidebar.tsx`.
- **Funcionalidad existente:** home de dashboard y navegación base a módulos de liga. Sidebar con active state via `usePathname`. Accesos globales de Equipos, Jugadores y Partidos funcionan como hubs de selección de liga; auditoría global y suscripciones en sidebar (con guard por rol en página). Métricas base (ligas/equipos/jugadores/próximos) + widgets operativos (próximos 5 partidos, últimas 5 acciones de auditoría visibles por RLS).
- **Pendiente:** métricas avanzadas (gráficas, tendencias).

### Ligas
- **Estado:** Implementado.
- **Evidencia en repo:** `app/dashboard/leagues/page.tsx`, `app/dashboard/leagues/[slug]/page.tsx`, `components/leagues/league-card.tsx`.
- **Funcionalidad existente:** listado y detalle por liga con navegación contextual.
- **Pendiente:** administración avanzada (configuración pública profunda, branding completo, etc.).

### Temporadas
- **Estado:** Implementado.
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/seasons/page.tsx`, `app/dashboard/leagues/[slug]/seasons/[seasonSlug]/page.tsx`, `components/seasons/create-season-form.tsx`.
- **Funcionalidad existente:** listado, creación y detalle de temporadas por liga.
- **Pendiente:** flujos avanzados de cierre/apertura automática y validaciones adicionales.

### Equipos
- **Estado:** Implementado (cobertura 100% para league_admin y team_admin).
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/teams/page.tsx`, `app/dashboard/leagues/[slug]/teams/[teamSlug]/page.tsx`, `app/dashboard/leagues/[slug]/teams/[teamSlug]/edit/page.tsx`, `app/dashboard/leagues/[slug]/teams/[teamSlug]/staff/`, `app/dashboard/leagues/[slug]/teams/[teamSlug]/roster/`, `components/teams/*`.
- **Funcionalidad existente:** listado, alta, edición y detalle de equipos; carga y actualización de logo/escudo del equipo (habilitado para league_admin y team_admin del club); administración completa de staff de equipo (`team_members` con roles `team_admin` y `coach`, protección de último admin); gestión integral de plantilla (`/roster`) y hub "Mis equipos".
- **Pendiente:** workflows administrativos avanzados por categoría y estadísticas históricas.

### Jugadores / plantillas
- **Estado:** Implementado.
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/players/page.tsx`, `app/dashboard/leagues/[slug]/players/[playerId]/page.tsx`, `app/dashboard/leagues/[slug]/players/[playerId]/registrations/page.tsx`, `app/dashboard/leagues/[slug]/teams/[teamSlug]/roster/page.tsx`, `components/players/*`, `components/registrations/*`.
- **Funcionalidad existente:** gestión de jugadores, edición y registro en plantillas/equipos por temporada.
- **Pendiente:** validaciones deportivas/reglamentarias avanzadas y reportes.

### Partidos
- **Estado:** Implementado (cobertura 100% para league_admin y referee).
- **Evidencia en repo:** `app/dashboard/matches/page.tsx`, `app/dashboard/leagues/[slug]/matches/page.tsx`, `app/dashboard/leagues/[slug]/matches/[matchId]/page.tsx`, `app/dashboard/leagues/[slug]/matches/[matchId]/edit/page.tsx`, `app/dashboard/leagues/[slug]/matches/[matchId]/cedula/page.tsx`, `components/matches/*`, `components/referees/*`.
- **Post-MVP Frentes 1, 2, 3 y 4:** 100% completados (Multi-árbitro, disponibilidad y notificaciones, auditoría automática SQL y media/métricas avanzadas).

### Resultados y eventos de partido
- **Estado:** Implementado.
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/matches/[matchId]/result/page.tsx`, `app/dashboard/leagues/[slug]/matches/[matchId]/events/page.tsx`, `components/matches/update-match-result-form.tsx`, `components/matches/create-match-event-form.tsx`.
- **Funcionalidad existente:** captura/actualización de marcadores y registro de eventos deportivos (goles, tarjetas, autogoles, sustituciones, penales) para ambos equipos por parte del árbitro asignado y filtrado por club para cuerpo técnico; ajuste administrativo de marcador/estado para partidos `completed` desde el detalle del partido; eliminación de eventos con auditoría.
- **Pendiente:** mayor trazabilidad y auditoría de cambios en UI.

### Tabla de posiciones
- **Estado:** Implementado con hardening MVP.
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/standings/page.tsx`, `app/dashboard/leagues/[slug]/seasons/[seasonSlug]/standings/page.tsx`, `app/dashboard/leagues/[slug]/seasons/[seasonSlug]/standings/actions.ts`, `components/standings/*`.
- **Funcionalidad existente:** consulta por temporada desde datos reales (`leagues`, `seasons`, `standings`, `teams`), vista desktop/mobile, recálculo manual y recálculo automático al guardar resultados de partidos cuando el estado queda en `completed` o deja de estarlo; historial de recálculos visible (últimos 10, desde auditoría) para admins de liga.
- **Implementado en hardening MVP:** resultado enriquecido del recálculo (`rowsCount`, `skippedMatchesCount`, resumen de filas), auditoría manual (`standings.recalculated_manual`), auditoría automática (`standings.recalculated_auto`) y auditoría de fallo (`standings.recalculate_failed`) con best-effort sin bloquear guardado del partido.
- **Post-MVP:** jobs/background reales, event bus/queue, triggers SQL, historial de standings y reglas avanzadas de desempate.

### Roles y permisos
- **Estado:** Implementado (super_admin 100%, league_admin 100%, team_admin 100%, coach 100%, referee 100%, viewer 100%).
- **Evidencia en repo:** `docs/ROLES_AND_PERMISSIONS.md`, `docs/DATABASE.md`, `types/database.ts`, migración inicial en `supabase/migrations/0001_initial_schema.sql`, `lib/permissions/league-permissions.ts`, `lib/permissions/match-permissions.ts`, `app/dashboard/matches/page.tsx`, `app/dashboard/leagues/[slug]/members/page.tsx`, `app/dashboard/leagues/[slug]/teams/[teamSlug]/staff/`, `app/dashboard/leagues/[slug]/teams/[teamSlug]/roster/`, `components/teams/*`, `components/registrations/*`, `components/members/*`, `components/referees/*`.
- **Funcionalidad existente:**
  - Modelo de roles y RLS estricto; protección en server actions y rutas dashboard.
  - `super_admin`: 100% (auditoría global, exportación CSV, gestión de suscripciones).
  - `league_admin`: 100% (gestión total de liga, temporadas, equipos, sedes, partidos, miembros, árbitros, auditoría de liga con exportación y retención).
  - `team_admin`: 100% (edición y logo de equipo, administración de staff de equipo con guardrail de último admin, gestión de plantilla/roster con alta/dorsal/estatus/baja, carga de foto de jugadores, registro y eliminación de eventos en partidos con filtro estricto por equipo, y hub centralizado "Mis equipos").
  - `coach`: 100% (gestión deportiva integral: alta, edición y foto de jugadores; inscripción, dorsal, estado y baja en plantilla de sus equipos; registro y eliminación de eventos en partidos donde participa su club; acceso directo en Hub "Mis equipos"; bloqueo estricto en UI y server actions de edición de equipo, logo, staff, marcadores y administración de liga).
  - `referee`: 100% (gestión arbitral completa: hubs y widgets "Mis partidos asignados" en dashboard y partidos, captura y ajuste de resultado técnico con restricción estricta de trigger RLS `ensure_match_update_scope`, captura y eliminación de eventos para ambos equipos participantes, consulta e impresión de cédula oficial de partido, panel arbitral en detalle, filtros dedicados en calendario, y bloqueo estricto de edición de programación, sedes, asignación de árbitros y administración institucional o deportiva).
  - `viewer`: 100% (modo consulta informativo sin acciones de mutación).
- **Post-MVP Frentes 1 y 2 (Multi-árbitro y Disponibilidad):** 100% completados con ternas completas (`match_officials`), retrocompatibilidad bidireccional, notificaciones in-app y calendario de indisponibilidad.

### Vista pública
- **Estado:** Implementado al 100% (MVP + Mejoras avanzadas de estadísticas y OpenGraph dinámico).
- **Evidencia en repo:** `app/page.tsx`, `app/explorar/page.tsx`, `app/contacto/page.tsx`, `app/liga/[slug]/page.tsx`, `app/liga/[slug]/standings/page.tsx`, `app/liga/[slug]/stats/page.tsx`, `app/liga/[slug]/matches/page.tsx`, `app/liga/[slug]/matches/[matchId]/page.tsx`, `app/liga/[slug]/teams/[teamSlug]/page.tsx`, `app/liga/[slug]/players/[playerId]/page.tsx`, `app/opengraph-image.tsx`, `app/liga/[slug]/opengraph-image.tsx`, `app/liga/[slug]/matches/[matchId]/opengraph-image.tsx`, `app/liga/[slug]/stats/opengraph-image.tsx`, `app/liga/[slug]/teams/[teamSlug]/opengraph-image.tsx`, `app/liga/[slug]/players/[playerId]/opengraph-image.tsx`, `components/public/*`, `components/stats/*`.
- **Funcionalidad existente:**
  - Resumen de liga con link a liga activa, métricas e historial.
  - Standings públicos con streaming Suspense, rachas de forma (W/D/L), escudos y caching ISR.
  - Módulo completo de estadísticas agregadas (`/liga/[slug]/stats`): goleadores (campo y penales), máximos asistentes, vallas invictas por club (clean sheets y porcentaje), fair play disciplinario (tarjetas amarillas/rojas y puntos) y tarjetas de métricas globales de temporada.
  - Calendario y partidos públicos con badge **EN VIVO** pulsante y filtros por estado, equipo y jornada/round.
  - Detalle público de partido con timeline interactivo de incidencias, cédula y filtros por categoría de evento.
  - Detalle público de club con plantilla oficial y partidos por temporada.
  - Detalle público de jugador con datos deportivos y perfil.
  - Navegación pública unificada mediante `PublicNav` con accesos a Resumen, Tabla, Estadísticas, Partidos y Equipos.
  - **Generación dinámica de imágenes OpenGraph (`next/og`):** Social previews 1200x630 generados en servidor para home, liga, partido (con marcador en vivo/finalizado y escudos), estadísticas, equipo y jugador.
  - Empty states informativos y manejo robusto de 404 (notFound).
- **QA realizado (2026-09-16):** Rutas públicas, compilación SSG/ISR, suites de tests (66/66) y linting de ESLint 100% en verde.

### Media uploads y Recursos Multimedia
- **Estado:** Implementado al 100% (MVP + Post-MVP Frente 4 completo).
- **Evidencia en repo:** `lib/media/upload-media.ts`, `lib/media/image-processor.ts`, `lib/media/media.test.ts`, `components/media/entity-image-upload-form.tsx`, `components/media/image-cropper-modal.tsx`, `components/media/multi-image-upload-form.tsx`, `components/media/media-gallery-grid.tsx`, `components/media/entity-image-preview.tsx`, `components/media/media-cleanup-form.tsx`, `components/ui/avatar.tsx`, `app/dashboard/profile/`, `app/dashboard/leagues/[slug]/media/`, `supabase/migrations/20260916081652_media_enhancements.sql`.
- **Funcionalidad existente:**
  - **Recorte y optimización client-side:** utilidad `cropAndResizeImage` con HTML5 Canvas en navegador (sin dependencias externas pesadas), presets automáticos según entidad (`square` 1:1 para logos y avatares, `portrait` 3:4 para fichas de jugadores, `free` libre), zoom interactivo (1x a 3x), controles de desplazamiento (pan X/Y) y exportación directa en formato comprimido WebP.
  - **Avatares y perfil de usuario:** módulo dedicado `/dashboard/profile` para todos los roles de la plataforma; componente reutilizable `Avatar` con fallback a iniciales o silueta; subida de foto de perfil con recorte 1:1, auditoría `profile.avatar_updated` y edición de datos personales (`display_name`, `full_name`, `phone`); integración visual destacada en el encabezado (`DashboardHeader`).
  - **Carga masiva (Multiple uploads):** formulario `MultiImageUploadForm` para selección múltiple de fotografías de partidos o eventos, vista previa en cuadrícula con eliminación individual y subida en lote vía `uploadBatchLeagueMediaAction` con auditoría `media.batch_uploaded`.
  - **Centro y galería de multimedia por liga:** módulo `/dashboard/leagues/[slug]/media` con cuadrícula de recursos gráficos (`MediaGalleryGrid`), filtros por tipo (logos, jugadores, galería general), copia rápida de URL pública, eliminación física y en BD con auditoría (`media.deleted`), y herramienta de limpieza de archivos huérfanos.
  - **CDN y optimización de URLs:** helper `resolveCdnMediaUrl` con soporte para dominios de CDN personalizados (`NEXT_PUBLIC_CDN_DOMAIN`) y transformaciones dinámicas de imagen en Supabase (`/render/image/public/...`).
  - **Schema y RLS de Storage:** migración `20260916081652_media_enhancements.sql` que permite `league_id` nulo en `media_uploads` para media global/avatares y habilita políticas de UPDATE y DELETE en `storage.objects` para el bucket `league-media`.

### Dashboard y Métricas de Competición
- **Estado:** Implementado al 100%.
- **Evidencia en repo:** `app/dashboard/page.tsx`, `components/dashboard/dashboard-trends-chart.tsx`.
- **Funcionalidad existente:**
  - KPIs principales: Ligas activas, Equipos registrados, Jugadores y Partidos próximos.
  - Componente de tendencias y analítica (`DashboardTrendsChart`):
    - Tarjetas de ritmo: total de goles anotados con promedio por partido finalizado y tasa porcentual de avance del calendario de juego.
    - Balance de disciplina / Fair Play: recuento de tarjetas amarillas y rojas con ratios por partido.
    - Barra de progreso segmentada de estado de partidos: porcentaje y recuento visual de partidos finalizados, en curso, programados y cancelados/pospuestos.
    - Gráfica interactiva de barras en SVG puro (sin dependencias externas ni problemas de SSR): alternancia entre goles por jornada y partidos por jornada, con tooltips y valores destacados.

### Auditoría
- **Estado:** Implementado (Fase 6C + hardening + búsqueda/retención/global/export + Triggers SQL automáticos).
- **Evidencia en repo:** tabla documentada en `docs/DATABASE.md` y políticas en documentación de roles; `supabase/migrations/20260916073000_automatic_audit_triggers.sql`, `lib/audit/create-audit-log.ts`, `lib/audit/audit-search.ts`, `app/dashboard/leagues/[slug]/audit/page.tsx`, `app/dashboard/leagues/[slug]/audit/actions.ts`, `app/dashboard/leagues/[slug]/audit/export/route.ts`, `app/dashboard/audit/page.tsx`, `app/dashboard/audit/export/route.ts`, `components/audit/*`.
- **Funcionalidad existente:** Vista de auditoria por liga filtrable por accion/entidad/actor/fechas + búsqueda de texto (acción/entidad/metadata); export CSV por liga y global (respeta filtros); purga por retención (90/180/365 días, auditada como `audit.purged`); vista global multi-liga solo `super_admin`; instrumentación best-effort en todos los server actions de liga; triggers SQL automáticos en Postgres (`trg_auto_audit_log` en `matches`, `match_events`, `match_officials`, `team_members`, `player_team_registrations`) de ejecución non-blocking y fail-safe con captura de actor (`auth.uid()`) y metadata estructurada.
- **Pendiente:** filtros full-text a nivel BD (pg_trgm); exportacion PDF.

### Tipos y catálogos
- **Estado:** Implementado como referencia administrativa.
- **Evidencia en repo:** `app/dashboard/types/page.tsx`.
- **Funcionalidad existente:** referencia de todos los catálogos del sistema (estados de liga/temporada/equipo/jugador/registro/partido, tipos de evento, pie dominante, roles, fases y formatos de liguilla) con indicación de en qué módulo se usa cada uno.
- **Nota:** los valores viven en enums de schema/código; su modificación requiere migración y queda fuera del MVP.
- **Suscripciones (solo super_admin):** gestión mínima implementada en `app/dashboard/subscriptions/` (CRUD de planes, activar/desactivar, asignar plan a liga con estados trialing/active/past_due/paused). Sin pasarela de cobro (licenciamiento manual).

## Pendientes críticos antes del MVP

1. Consolidar ejecución event-driven real para standings (jobs/background/queue/triggers), manteniendo auditoría ya instrumentada.
2. ~~Completar vista pública mínima para consulta externa (ligas, calendario/partidos y tabla).~~ ✅ Implementado.
3. ~~Validar end-to-end permisos por rol en flujos críticos (partidos, resultados, eventos, edición de entidades).~~ ✅ Hardening UX implementado (ocultar CTAs administrativas para usuarios sin permisos). QA funcional por rol pendiente si hay segunda cuenta disponible.
4. Ejecutar QA funcional y responsive completa sobre módulos ya implementados (RC pre-MVP ejecutado el 2026-05-19; pendientes: validación multi-cuenta real y navegador gráfico).


## QA Release Candidate pre-MVP (2026-05-19)

- **Documento fuente:** `docs/QA_RELEASE_CANDIDATE.md`.
- **Resultado de comandos:** `npm run lint` ✅, `npm run build` ✅, `npm test` no configurado.
- **Validado:** build/lint, árbol de rutas públicas y dashboard, preservación de guardrails de permisos/auditoría/standings por code review.
- **Code-reviewed only:** flujos funcionales con mutación real (roles, árbitros, recálculo manual/automático) y responsive visual real.
- **Pendiente por entorno:** QA multi-cuenta por rol y validación responsive con navegador gráfico.
- **Recomendación:** **Go with caveats** → MVP candidate listo para pruebas controladas, no para producción comercial completa.

## QA UI/UX pre-MVP (2026-05-19)

- **Documento fuente:** `docs/QA_UI_UX_PRE_MVP.md`.
- **Commit base:** `dfcea05`.
- **Resultado de comandos:** `npm run lint` ✅, `npm run build` ✅ (34 rutas).
- **Validado:** auditoría visual, semántica, accesibilidad, formularios, consistencia visual y permisos por code review.
- **Fixes aplicados:**
  - `entity-image-upload-form.tsx`: label en input file, botón `Button` component.
  - `referee-assignment-form.tsx`: label `sr-only` en select, botón `Button` component, `disabled` en select.
  - `league-member-role-form.tsx`: label `sr-only` en select, botón `Button` component, `disabled` en select.
  - `standings-table-view.tsx`: `scope="col"` y `title` descriptivos en todos los `<th>`.
  - `create-player-form.tsx`: help text en campo `photo_url`.
- **UI/UX Fase 4:** Completada para MVP.
- **UI/UX Fase 5:** QA visual pre-MVP ejecutado; pendientes cross-browser/multi-cuenta documentados.

## Pendientes post-MVP

1. Auditoría avanzada/global/exportable y cobertura exhaustiva de acciones.
2. Hardening post-MVP de media uploads (cleanup/borrado físico/transformaciones/CDN).
3. Roles avanzados y permisos granulares por feature.
4. Suscripciones/pagos y operación comercial SaaS.

## Riesgos técnicos conocidos

- Posible desfase entre schema y cobertura UI real por módulo.
- Existen módulos documentados/estructurados en BD que aún no tienen flujo funcional completo.
- El recálculo automático actual depende del flujo de guardado de resultados; aún no existe pipeline event-driven/background con auditoría.
- Roles/RLS existentes sin necesariamente tener consola UI completa de administración.
- Necesidad de pruebas manuales mobile/desktop y regresión transversal tras cambios.

## Última actualización

- Fecha: 2026-09-16
- Branch: main
- Nota:
  - Cierre operativo del rol `coach` al 100%:
    - Gestión deportiva de jugadores (alta, edición y fotos vía `canManagePlayers`).
    - Gestión deportiva de plantilla (`/roster`: inscripción de jugadores, actualización de estatus/dorsal y baja vía `isTeamStaff`).
    - Captura y eliminación de eventos en partidos donde participa su equipo (`/events` con `allowedTeamIds`).
    - Hub "Mis equipos" con insignia "Cuerpo técnico" y accesos directos.
    - Bloqueo fail-closed estricto en UI y Server Actions para edición de equipo, logo, staff, marcadores y liga.
  - Cobertura de roles al día: `super_admin` 100%, `league_admin` 100%, `team_admin` 100%, `coach` 100%, `viewer` 100%, `referee` ~80%.
  - Build, tests (45/45) y lint en verde.

### Historial relevante

- 2026-09-16: Cierre operativo al 100% del rol `coach` (operaciones deportivas completas en jugadores, plantilla, eventos y Hub; controles administrativos bloqueados).
- 2026-09-15: Cierre operativo al 100% del rol `team_admin` (staff, plantilla, logo, foto jugador, eventos filtrados, eliminación de eventos y Hub "Mis equipos").
- 2026-09-15: Auditoría exhaustiva completada (instrumentación, vista global, exportación CSV, retención/purga) y RBAC granular v1.
- 2026-05-19: QA UI/UX pre-MVP completado — fixes de accesibilidad, semántica y consistencia visual (`docs/QA_UI_UX_PRE_MVP.md`).
- 2026-05-19: Media Uploads MVP implementado (`a4f6e86`).
- 2026-05-19: Setup real de Storage completado para `league-media` (`ace2702`).
- 2026-05-19: QA real de media uploads validada con usuario dedicado (`5f748f7`).
- 2026-05-19: Policy pública mínima para `players` en ligas públicas activas (`1c1fb58`).
- 2026-05-18: Hardening Fase 6 - filtros de auditoria validados server-side (`action`/`entityType`) y cleanup documental de Fase 6.
- 2026-05-18: Fase 6C - Auditoria visible en UI (`app/dashboard/leagues/[slug]/audit/page.tsx`, `components/audit/*`, `lib/audit/create-audit-log.ts`, helper extendido con `canViewAuditLogs`/`canManageAuditLogs`).
- 2026-05-18: Fase 6B - Asignacion basica de arbitros a partidos (`app/dashboard/leagues/[slug]/matches/[matchId]/referee/actions.ts`, `components/referees/*`, helper extendido con `canAssignReferees`/`canViewRefereeAssignments`).
- 2026-05-18: Fase 6A - UI de administracion de miembros por liga (`app/dashboard/leagues/[slug]/members/`, `components/members/*`, helper extendido con `canManageMembers`/`canManageRoles`).
- 2026-05-18: Fase 5 publica completada para MVP: ruta `/liga/[slug]/players/[playerId]`, eventos publicos con resumen/filtros, filtros de partidos por estado/equipo/jornada, SEO basico con metadata/OpenGraph/Twitter.
- 2026-05-04: QA publico real y fix menor en `PublicNav` (`4840694e`).
- 2026-05-04: Hardening UX de permisos en dashboard (`lib/permissions/league-permissions.ts` + ocultamiento de CTAs administrativas segun rol).
- 2026-05-04: Detalle publico de partido (`app/liga/[slug]/matches/[matchId]/page.tsx`) + enlaces desde lista de partidos y detalle de equipo.


- Referencia: `docs/QA_MEDIA_UPLOADS.md` para QA de Media Uploads MVP.

