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
- **Funcionalidad existente:** captura/actualización de marcadores y registro de eventos deportivos.
- **Pendiente:** mayor trazabilidad y auditoría de cambios en UI.

### Tabla de posiciones
- **Estado:** Implementado (con mejoras pendientes).
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/standings/page.tsx`, `app/dashboard/leagues/[slug]/seasons/[seasonSlug]/standings/page.tsx`, `app/dashboard/leagues/[slug]/seasons/[seasonSlug]/standings/actions.ts`, `components/standings/*`.
- **Funcionalidad existente:** consulta por temporada desde datos reales (`leagues`, `seasons`, `standings`, `teams`), vista desktop/mobile, recálculo manual y recálculo automático al guardar resultados de partidos cuando el estado queda en `completed` o deja de estarlo.
- **Pendiente:** automatización avanzada por eventos, auditoría de recalculos y estrategia de jobs/background para cargas mayores.

### Roles y permisos
- **Estado:** Base técnica existente.
- **Evidencia en repo:** `docs/ROLES_AND_PERMISSIONS.md`, `docs/DATABASE.md`, `types/database.ts`, migración inicial en `supabase/migrations/0001_initial_schema.sql`.
- **Funcionalidad existente:** modelo de roles y RLS definido a nivel de datos; protección de acceso por usuario autenticado en rutas dashboard.
- **Pendiente:** UI completa de administración de permisos/roles y flujos avanzados por rol.

### Vista pública
- **Estado:** Pendiente.
- **Evidencia en repo:** existe landing (`app/page.tsx`) y modelo de datos público en docs/schema, sin portal público deportivo completo.
- **Funcionalidad existente:** entrada pública básica del sitio.
- **Pendiente:** páginas públicas de ligas, equipos, partidos, standings y navegación para aficionados.

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
2. Completar vista pública mínima para consulta externa (ligas, calendario/partidos y tabla).
3. Validar end-to-end permisos por rol en flujos críticos (partidos, resultados, eventos, edición de entidades).
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

- Fecha: 2026-05-03
- Branch: (ver `git branch --show-current`)
- Commit: (actualizar con `git rev-parse --short HEAD` en cada cambio relevante)
