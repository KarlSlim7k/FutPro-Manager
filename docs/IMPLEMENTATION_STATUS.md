# Implementation Status

## Resumen ejecutivo

El MVP de FutPro Manager ya cuenta con autenticación, rutas protegidas de dashboard y varios módulos operativos para gestión deportiva (ligas, temporadas, equipos, jugadores, sedes, partidos, resultados y eventos). También existe una vista de tabla de posiciones que consume datos reales de Supabase.

Estado actual del MVP:

- **Funcionando**: login, protección de rutas, navegación de dashboard, CRUD base de ligas/temporadas/equipos/jugadores/sedes/partidos, captura de resultado y eventos, y consulta de standings.
- **Parcialmente listo**: standings (vista activa, recálculo manual y recálculo automático al guardar resultados que impactan `completed`; pendientes avanzados de automatización/eventos).
- **Falta para MVP operativo completo**: robustecer automatización avanzada de standings (eventos/auditoría/jobs), robustecer roles avanzados en UI, vista pública integral y cobertura de QA end-to-end.
- **Solo en base técnica (schema/RLS)**: media uploads, auditoría y suscripciones/pagos con tablas/políticas existentes pero sin flujo UI/negocio completo.

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
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/matches/page.tsx`, `app/dashboard/leagues/[slug]/matches/[matchId]/page.tsx`, `app/dashboard/leagues/[slug]/matches/[matchId]/edit/page.tsx`, `components/matches/create-match-form.tsx`.
- **Funcionalidad existente:** creación, edición y detalle de partidos por liga.
- **Pendiente:** calendario avanzado/filtros y asignaciones formales de árbitros con historial.

### Resultados y eventos de partido
- **Estado:** Implementado.
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/matches/[matchId]/result/page.tsx`, `app/dashboard/leagues/[slug]/matches/[matchId]/events/page.tsx`, `components/matches/update-match-result-form.tsx`, `components/matches/create-match-event-form.tsx`.
- **Funcionalidad existente:** captura/actualización de marcadores y registro de eventos deportivos, incluyendo ajuste administrativo de marcador/estado para partidos `completed` desde el detalle del partido.
- **Pendiente:** mayor trazabilidad y auditoría de cambios en UI.

### Tabla de posiciones
- **Estado:** Implementado (con mejoras pendientes).
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/standings/page.tsx`, `app/dashboard/leagues/[slug]/seasons/[seasonSlug]/standings/page.tsx`, `app/dashboard/leagues/[slug]/seasons/[seasonSlug]/standings/actions.ts`, `components/standings/*`.
- **Funcionalidad existente:** consulta por temporada desde datos reales (`leagues`, `seasons`, `standings`, `teams`), vista desktop/mobile, recálculo manual y recálculo automático al guardar resultados de partidos cuando el estado queda en `completed` o deja de estarlo.
- **Pendiente:** automatización avanzada por eventos, auditoría de recalculos y estrategia de jobs/background para cargas mayores.

### Roles y permisos
- **Estado:** Parcial (base técnica + hardening UX implementado).
- **Evidencia en repo:** `docs/ROLES_AND_PERMISSIONS.md`, `docs/DATABASE.md`, `types/database.ts`, migración inicial en `supabase/migrations/0001_initial_schema.sql`, `lib/permissions/league-permissions.ts`.
- **Funcionalidad existente:** modelo de roles y RLS definido a nivel de datos; protección de acceso por usuario autenticado en rutas dashboard; helper server-side `getLeaguePermissions` para calcular flags UX por liga; páginas del dashboard ocultan CTAs administrativas según rol.
- **Pendiente:** UI completa de administración de permisos/roles, RBAC granular por feature/equipo/partido y flujos avanzados por rol.

### Vista pública
- **Estado:** Parcial (vista pública mínima implementada).
- **Evidencia en repo:** `app/liga/[slug]/page.tsx`, `app/liga/[slug]/standings/page.tsx`, `app/liga/[slug]/matches/page.tsx`, `app/liga/[slug]/teams/[teamSlug]/page.tsx`, `components/public/*`.
- **Funcionalidad existente:** landing pública con link a liga activa; páginas públicas de resumen de liga, tabla de posiciones por temporada, calendario de partidos y detalle público de equipo con plantilla y partidos por temporada; navegación pública entre vistas; empty states; metadata dinámico básico.
- **Pendiente:** detalle público de partido, detalle público de jugador, eventos públicos, SEO avanzado, filtros avanzados, sharing/social previews.
- **Nota:** standings público ahora enlaza a detalle de equipo; la plantilla pública depende de RLS existente para `player_team_registrations` y `players`.
- **QA realizado (2026-05-04):** rutas públicas validadas con datos reales de Supabase/RLS en modo read-only; build y lint pasan; fix menor en navegación pública (`PublicNav`).

### Media uploads
- **Estado:** Base técnica existente.
- **Evidencia en repo:** tabla documentada en `docs/DATABASE.md` y tipos en `types/database.ts`.
- **Funcionalidad existente:** soporte de datos preparado en schema.
- **Pendiente:** UI/flujo de carga, permisos operativos y consumo de archivos.

### Auditoría
- **Estado:** Base técnica existente.
- **Evidencia en repo:** tabla documentada en `docs/DATABASE.md` y políticas en documentación de roles.
- **Funcionalidad existente:** capacidad estructural para registrar acciones.
- **Pendiente:** instrumentación funcional en app y pantallas de consulta.

### Suscripciones / pagos
- **Estado:** Base técnica existente.
- **Evidencia en repo:** `subscription_plans` y `league_subscriptions` en docs/schema.
- **Funcionalidad existente:** modelo de datos inicial para evolución SaaS.
- **Pendiente:** integración real de cobros/pasarela, UX de planes y gestión comercial.

## Pendientes críticos antes del MVP

1. Consolidar automatización avanzada de standings (event-driven/auditable) y estrategia de ejecución en background.
2. ~~Completar vista pública mínima para consulta externa (ligas, calendario/partidos y tabla).~~ ✅ Implementado.
3. ~~Validar end-to-end permisos por rol en flujos críticos (partidos, resultados, eventos, edición de entidades).~~ ✅ Hardening UX implementado (ocultar CTAs administrativas para usuarios sin permisos). QA funcional por rol pendiente si hay segunda cuenta disponible.
4. Ejecutar QA funcional y responsive completa sobre módulos ya implementados.

## Pendientes post-MVP

1. Auditoría operativa visible en UI.
2. Media uploads integrados por entidad.
3. Roles avanzados y permisos granulares por feature.
4. Suscripciones/pagos y operación comercial SaaS.

## Riesgos técnicos conocidos

- Posible desfase entre schema y cobertura UI real por módulo.
- Existen módulos documentados/estructurados en BD que aún no tienen flujo funcional completo.
- El recálculo automático actual depende del flujo de guardado de resultados; aún no existe pipeline event-driven/background con auditoría.
- Roles/RLS existentes sin necesariamente tener consola UI completa de administración.
- Necesidad de pruebas manuales mobile/desktop y regresión transversal tras cambios.

## Última actualización

- Fecha: 2026-05-04
- Branch: main
- Commit: `4840694e` (+ QA público real y fix menor en `PublicNav`)
- Commit posterior: hardening UX de permisos en dashboard (`lib/permissions/league-permissions.ts` + ocultamiento de CTAs administrativas según rol en páginas de matches, standings, seasons, teams, players, venues y detalle de partido).
