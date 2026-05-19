# Implementation Status

## Resumen ejecutivo

El MVP de FutPro Manager ya cuenta con autenticación, rutas protegidas de dashboard y varios módulos operativos para gestión deportiva (ligas, temporadas, equipos, jugadores, sedes, partidos, resultados y eventos). También existe una vista de tabla de posiciones que consume datos reales de Supabase.

Estado actual del MVP:

- **Funcionando**: login, protección de rutas, navegación de dashboard, CRUD base de ligas/temporadas/equipos/jugadores/sedes/partidos, captura de resultado y eventos, y consulta de standings.
- **Funcionando**: standings con hardening MVP (recálculo manual + automático, auditoría best-effort de recálculos, warnings controlados por inconsistencias y revalidación dashboard/pública).
- **Falta para MVP operativo completo**: robustecer automatización avanzada de standings (eventos/auditoría/jobs), robustecer roles avanzados en UI y cobertura de QA end-to-end.
- **Solo en base técnica (schema/RLS)**: suscripciones/pagos con tablas/políticas existentes pero sin flujo UI/negocio completo.
- **Implementado con dependencia operativa externa**: media uploads MVP (requiere bucket/policies de Supabase Storage por entorno).

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
- **Funcionalidad existente:** home de dashboard y navegación base a módulos de liga.
- **Pendiente:** métricas avanzadas y widgets operativos adicionales.

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
- **Estado:** Implementado.
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/teams/page.tsx`, `app/dashboard/leagues/[slug]/teams/[teamSlug]/page.tsx`, `app/dashboard/leagues/[slug]/teams/[teamSlug]/edit/page.tsx`, `components/teams/*`.
- **Funcionalidad existente:** listado, alta, edición y detalle de equipos.
- **Pendiente:** workflows administrativos avanzados por estado/categoría.

### Jugadores / plantillas
- **Estado:** Implementado.
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/players/page.tsx`, `app/dashboard/leagues/[slug]/players/[playerId]/page.tsx`, `app/dashboard/leagues/[slug]/players/[playerId]/registrations/page.tsx`, `app/dashboard/leagues/[slug]/teams/[teamSlug]/roster/page.tsx`, `components/players/*`, `components/registrations/*`.
- **Funcionalidad existente:** gestión de jugadores, edición y registro en plantillas/equipos por temporada.
- **Pendiente:** validaciones deportivas/reglamentarias avanzadas y reportes.

### Partidos
- **Estado:** Implementado.
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/matches/page.tsx`, `app/dashboard/leagues/[slug]/matches/[matchId]/page.tsx`, `app/dashboard/leagues/[slug]/matches/[matchId]/edit/page.tsx`, `components/matches/create-match-form.tsx`, `components/referees/referee-assignment-card.tsx`, `components/referees/referee-assignment-form.tsx`.
- **Funcionalidad existente:** creacion, edicion y detalle de partidos por liga; asignacion basica de arbitros a partidos (asignar/quitar desde detalle de partido, visualizacion en listado).
- **Pendiente:** calendario avanzado/filtros y tabla de asignaciones de arbitros con historial.

### Resultados y eventos de partido
- **Estado:** Implementado.
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/matches/[matchId]/result/page.tsx`, `app/dashboard/leagues/[slug]/matches/[matchId]/events/page.tsx`, `components/matches/update-match-result-form.tsx`, `components/matches/create-match-event-form.tsx`.
- **Funcionalidad existente:** captura/actualización de marcadores y registro de eventos deportivos, incluyendo ajuste administrativo de marcador/estado para partidos `completed` desde el detalle del partido.
- **Pendiente:** mayor trazabilidad y auditoría de cambios en UI.

### Tabla de posiciones
- **Estado:** Implementado con hardening MVP.
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/standings/page.tsx`, `app/dashboard/leagues/[slug]/seasons/[seasonSlug]/standings/page.tsx`, `app/dashboard/leagues/[slug]/seasons/[seasonSlug]/standings/actions.ts`, `components/standings/*`.
- **Funcionalidad existente:** consulta por temporada desde datos reales (`leagues`, `seasons`, `standings`, `teams`), vista desktop/mobile, recálculo manual y recálculo automático al guardar resultados de partidos cuando el estado queda en `completed` o deja de estarlo.
- **Implementado en hardening MVP:** resultado enriquecido del recálculo (`rowsCount`, `skippedMatchesCount`, resumen de filas), auditoría manual (`standings.recalculated_manual`), auditoría automática (`standings.recalculated_auto`) y auditoría de fallo (`standings.recalculate_failed`) con best-effort sin bloquear guardado del partido.
- **Post-MVP:** jobs/background reales, event bus/queue, triggers SQL, historial de standings y reglas avanzadas de desempate.

### Roles y permisos
- **Estado:** Parcial (base tecnica + hardening UX + administracion de miembros por liga + asignacion basica de arbitros implementada).
- **Evidencia en repo:** `docs/ROLES_AND_PERMISSIONS.md`, `docs/DATABASE.md`, `types/database.ts`, migracion inicial en `supabase/migrations/0001_initial_schema.sql`, `lib/permissions/league-permissions.ts`, `app/dashboard/leagues/[slug]/members/page.tsx`, `app/dashboard/leagues/[slug]/members/actions.ts`, `components/members/role-badge.tsx`, `components/members/league-members-table.tsx`, `components/members/league-member-role-form.tsx`, `app/dashboard/leagues/[slug]/matches/[matchId]/referee/actions.ts`, `components/referees/referee-assignment-form.tsx`, `components/referees/referee-assignment-card.tsx`.
- **Funcionalidad existente:** modelo de roles y RLS definido a nivel de datos; proteccion de acceso por usuario autenticado en rutas dashboard; helper server-side `getLeaguePermissions` para calcular flags UX por liga; paginas del dashboard ocultan CTAs administrativas segun rol; UI de administracion de miembros por liga con cambio de rol y guardrails (no super_admin desde UI, proteccion de ultimo league_admin); helper extendido con `canManageMembers`/`canManageRoles`/`canAssignReferees`/`canViewRefereeAssignments`; asignacion basica de arbitros a partidos desde detalle.
- **Pendiente:** RBAC granular por feature/equipo/partido, consola avanzada de roles, tabla de asignaciones de arbitros con historial, auditoria visible en UI.

### Vista pública
- **Estado:** Implementado para MVP.
- **Evidencia en repo:** `app/liga/[slug]/page.tsx`, `app/liga/[slug]/standings/page.tsx`, `app/liga/[slug]/matches/page.tsx`, `app/liga/[slug]/matches/[matchId]/page.tsx`, `app/liga/[slug]/teams/[teamSlug]/page.tsx`, `app/liga/[slug]/players/[playerId]/page.tsx`, `components/public/*`, `components/public/public-match-events.tsx`.
- **Funcionalidad existente:**
  - Resumen de liga con link a liga activa.
  - Standings publicos por temporada.
  - Calendario/lista de partidos con filtros (estado, equipo, jornada/round).
  - Detalle publico de partido con timeline visual de eventos, resumen por categorias y filtros (todos/goles/tarjetas/sustituciones/penales).
  - Detalle publico de equipo con plantilla y partidos por temporada.
  - Detalle publico de jugador.
  - Metadata basica SEO/OpenGraph/Twitter en vistas publicas principales.
  - Navegacion publica entre vistas.
  - Empty states y manejo de rutas inexistentes (notFound).
- **Post-MVP:** E2E automatizado, QA visual cross-browser, social previews avanzados con imagenes dinamicas, estadisticas publicas avanzadas.
- **Nota:** standings publico enlaza a detalle de equipo; lista de partidos y detalle de equipo enlazan a detalle de partido; la plantilla publica depende de RLS existente para `player_team_registrations` y `players`; eventos publicos se muestran en timeline visual con etiquetas local/visitante y no rompen la pagina si RLS no permite lectura.
- **QA realizado (2026-05-04):** rutas publicas validadas con datos reales de Supabase/RLS en modo read-only; build y lint pasan; fix menor en navegacion publica (`PublicNav`).
- **QA actualizado (2026-05-18):** detalle de jugador, eventos con filtros, filtros de partidos y SEO basico validados via code review, build y lint (PR #4, PR #5).

### Media uploads
- **Estado:** Implementado para MVP; requiere setup operativo de Storage.
- **Evidencia en repo:** `lib/media/upload-media.ts`, `components/media/entity-image-upload-form.tsx`, `components/media/entity-image-preview.tsx`, server actions de media en liga/equipo/jugador, `docs/QA_MEDIA_UPLOADS.md`, `docs/STORAGE_SETUP.md`.
- **Funcionalidad existente:** upload de logo de liga, logo de equipo y foto de jugador con validación server-side de MIME/tamaño, metadata en `media_uploads`, auditoría best-effort y fallback controlado cuando falta configuración de Storage.
- **Pendiente:** hardening post-MVP (cleanup de huérfanos, borrado físico, transformaciones/crop/resize, múltiples imágenes, avatares, CDN/custom domain).

### Auditoría
- **Estado:** Parcial (Fase 6C implementada + hardening de filtros server-side).
- **Evidencia en repo:** tabla documentada en `docs/DATABASE.md` y políticas en documentación de roles; `lib/audit/create-audit-log.ts`, `app/dashboard/leagues/[slug]/audit/page.tsx`, `components/audit/*`.
- **Funcionalidad existente:** Vista de auditoria por liga filtrable por accion/entidad/actor/fechas; `action` y `entityType` validados server-side con allowlist (valores invalidos se ignoran sin crash); helper best-effort de insercion `createAuditLog`; instrumentacion en cambio de rol de miembro (`member.role_updated`) y asignacion/remocion de arbitro (`match.referee_updated`/`match.referee_removed`). Visible solo para `super_admin` y `league_admin`. Sin cambios a schema/RLS/migraciones.
- **Pendiente:** Instrumentacion exhaustiva de todos los server actions; auditoria automatica via triggers SQL o event bus; auditoria global para `super_admin`; exportacion CSV/PDF; retencion avanzada; filtros full-text.

### Suscripciones / pagos
- **Estado:** Base técnica existente.
- **Evidencia en repo:** `subscription_plans` y `league_subscriptions` en docs/schema.
- **Funcionalidad existente:** modelo de datos inicial para evolución SaaS.
- **Pendiente:** integración real de cobros/pasarela, UX de planes y gestión comercial.

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

- Fecha: 2026-05-19
- Branch: main
- Commit/PR:
  - Standings hardening: PR #11 / merge `383770d`
  - QA RC pre-MVP: commit `5069204`
- Nota:
  - Standings hardening MVP implementado.
  - QA Release Candidate pre-MVP ejecutada.
  - Resultado: Go with caveats → MVP controlled test.

### Historial relevante

- 2026-05-18: Hardening Fase 6 - filtros de auditoria validados server-side (`action`/`entityType`) y cleanup documental de Fase 6.
- 2026-05-18: Fase 6C - Auditoria visible en UI (`app/dashboard/leagues/[slug]/audit/page.tsx`, `components/audit/*`, `lib/audit/create-audit-log.ts`, helper extendido con `canViewAuditLogs`/`canManageAuditLogs`).
- 2026-05-18: Fase 6B - Asignacion basica de arbitros a partidos (`app/dashboard/leagues/[slug]/matches/[matchId]/referee/actions.ts`, `components/referees/*`, helper extendido con `canAssignReferees`/`canViewRefereeAssignments`).
- 2026-05-18: Fase 6A - UI de administracion de miembros por liga (`app/dashboard/leagues/[slug]/members/`, `components/members/*`, helper extendido con `canManageMembers`/`canManageRoles`).
- 2026-05-18: Fase 5 publica completada para MVP: ruta `/liga/[slug]/players/[playerId]`, eventos publicos con resumen/filtros, filtros de partidos por estado/equipo/jornada, SEO basico con metadata/OpenGraph/Twitter.
- 2026-05-04: QA publico real y fix menor en `PublicNav` (`4840694e`).
- 2026-05-04: Hardening UX de permisos en dashboard (`lib/permissions/league-permissions.ts` + ocultamiento de CTAs administrativas segun rol).
- 2026-05-04: Detalle publico de partido (`app/liga/[slug]/matches/[matchId]/page.tsx`) + enlaces desde lista de partidos y detalle de equipo.


- Referencia: `docs/QA_MEDIA_UPLOADS.md` para QA de Media Uploads MVP.
