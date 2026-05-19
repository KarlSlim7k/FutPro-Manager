# QA Release Candidate Pre-MVP

## Meta
- **Fecha:** 2026-05-19
- **Repositorio:** `FutPro-Manager`
- **Branch probado:** `work`
- **Commit base probado:** `b55b7b0`
- **Entorno de prueba:** Local CLI (sin navegador gráfico), build de Next.js, revisión de código, sin mutaciones de datos reales.

## Comandos ejecutados
- `npm run lint` ✅
- `npm run build` ✅
- `npm test` ❌ (no configurado en `package.json`)

## Resultado general
**GO WITH CAVEATS** para **MVP controlled test**.

El candidato MVP pasa lint/build y no presenta regresiones evidentes por compilación ni por revisión de flujos críticos en código. La cobertura funcional real multi-rol y la validación visual responsive quedan parcialmente pendientes por no contar con segunda cuenta de pruebas ni navegador gráfico en este entorno.

## Alcance validado

### 1) Autenticación y protección de rutas
- `/login` existe y compila.
- Dashboard protegido por layout/middleware (sin sesión redirige a `/login`).
- Rutas públicas bajo `/liga/[slug]` son accesibles sin login por diseño.
- No hay CTAs administrativos en vistas públicas (code-reviewed).

**Estado:** `Code-reviewed only` + validación indirecta por build.

### 2) Dashboard base y navegación
- Rutas principales presentes en output de build:
  - `/dashboard`
  - `/dashboard/leagues`
  - `/dashboard/leagues/[slug]`
- Módulos esperados presentes en árbol de rutas dinámicas (seasons, teams, players, matches, standings, members, audit).

**Estado:** `Code-reviewed only`.

### 3) Módulos administrativos
- Ligas, temporadas, equipos, jugadores, sedes y partidos: rutas/forms/componentes presentes y compilando.
- Sin ejecución de mutaciones reales en este entorno.

**Estado:** `Code-reviewed only`.

### 4) Standings hardening
- Se mantiene recálculo manual y automático.
- Se mantiene comportamiento no bloqueante cuando falla recálculo automático.
- Se auditan eventos:
  - `standings.recalculated_manual`
  - `standings.recalculated_auto`
  - `standings.recalculate_failed`
- Filtros de auditoría soportan `season` y nuevas acciones.
- Revalidaciones dashboard/públicas presentes.

**Estado:** `Code-reviewed only` (sin ejecución real de recálculo en entorno de datos).

### 5) Fase 5 pública
Rutas incluidas y compilando:
- `/liga/[slug]`
- `/liga/[slug]/standings`
- `/liga/[slug]/matches`
- `/liga/[slug]/matches/[matchId]`
- `/liga/[slug]/teams/[teamSlug]`
- `/liga/[slug]/players/[playerId]`

- `notFound()`/fallbacks validados por revisión de patrones existentes y docs QA previas.
- Sin CTAs administrativos en vistas públicas (code review).
- SEO básico no rompe build.

**Estado:** `Validado previamente + code-reviewed`.

### 6) Fase 6A miembros/roles
- Ruta `/dashboard/leagues/[slug]/members` existe y compila.
- Guardrails de cambio de rol (no `super_admin`, no dejar liga sin `league_admin`) se mantienen.
- Auditoría `member.role_updated` instrumentada best-effort.

**Estado:** `Code-reviewed only` en esta corrida RC.

### 7) Fase 6B árbitros
- Rutas y componentes de asignación/remoción presentes y compilando.
- Restricción de asignación por rol de miembro y pertenencia a liga presente.
- Auditoría `match.referee_updated` / `match.referee_removed` instrumentada.

**Estado:** `Code-reviewed only` en esta corrida RC.

### 8) Fase 6C auditoría
- Ruta `/dashboard/leagues/[slug]/audit` incluida en build.
- Filtros server-side con allowlist (`action`, `entityType`) se mantienen.
- Manejo seguro de filtros inválidos documentado y preservado.

**Estado:** `Code-reviewed only` en esta corrida RC.

### 9) Responsive
Sin navegador gráfico disponible.

Revisión de patrones responsive en componentes/listados/tablas:
- uso de `md:hidden` / `hidden md:block`
- tablas con variantes mobile cards
- `overflow-x-auto` en tablas
- grids/breakpoints utilitarios

**Estado:** `Code-reviewed only`.

## Bugs encontrados en esta corrida
- No se detectaron bugs funcionales nuevos de bajo riesgo en la corrida actual.
- No se aplicaron cambios de código de producto.

## Fixes aplicados
- Documentación RC consolidada.
- Alineación de estado en docs (`ROADMAP`, `IMPLEMENTATION_STATUS`, QA docs cruzadas).

## Riesgos restantes
1. Falta QA funcional multi-rol con segunda cuenta real (`team_admin`, `coach`, `referee`, `viewer`).
2. Falta validación visual real responsive (mobile/tablet/desktop con navegador).
3. Falta suite automatizada (`npm test` no configurado).
4. Persisten pendientes post-MVP (jobs/event-bus/triggers/historial avanzado de standings, pagos, media uploads).

## Recomendación final
**Go with caveats → GO MVP controlled test.**

Apto para pruebas controladas del MVP (staging/entorno QA con cuentas reales), **no** para declaración de “producción comercial lista”.

## Referencias QA relacionadas
- `docs/QA_PUBLIC_VIEWS.md`
- `docs/QA_AUDIT_LOGS.md`
- `docs/QA_PERMISSIONS_UX.md`
- `docs/QA_STANDINGS_HARDENING.md`
