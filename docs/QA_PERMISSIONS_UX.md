# QA de Permisos UX - Dashboard

## Alcance

Validación del hardening UX de permisos en el dashboard de FutPro Manager.

## Reglas de permisos aplicadas en UI

| Rol | Ver listados | Crear/editar entidades | Capturar resultado | Registrar eventos | Recalcular standings |
| --- | --- | --- | --- | --- | --- |
| `super_admin` | Sí | Sí | Sí | Sí | Sí |
| `league_admin` (de la liga) | Sí | Sí | Sí | Sí | Sí |
| `team_admin` | Sí | No | No | No | No |
| `coach` | Sí | No | No | No | No |
| `referee` | Sí | No | No* | No* | No |
| `viewer` | Sí | No | No | No | No |
| Sin rol en liga | Sí | No | No | No | No |

\* En esta fase MVP, `referee` no ve acciones de resultado/eventos en listado porque no hay validación UI clara de asignación por partido. RLS sigue permitiéndolo si es el árbitro asignado (`matches.referee_id`).

## Rutas verificadas por code review

- `/dashboard/leagues/[slug]/matches` - oculta CreateMatchForm y acciones de MatchCard según permisos.
- `/dashboard/leagues/[slug]/standings` - oculta link "Recalcular tabla" y empty state actions.
- `/dashboard/leagues/[slug]/seasons` - oculta CreateSeasonForm.
- `/dashboard/leagues/[slug]/teams` - oculta CreateTeamForm.
- `/dashboard/leagues/[slug]/players` - oculta CreatePlayerForm.
- `/dashboard/leagues/[slug]/venues` - oculta CreateVenueForm.
- `/dashboard/leagues/[slug]/matches/[matchId]` - oculta "Editar", "Capturar resultado", "Eventos" y ajuste administrativo.
- `/dashboard/leagues/[slug]/seasons/[seasonSlug]/standings` - oculta RecalculateStandingsForm.

## QA funcional

### Usuario league_admin
- **Estado:** Sin cuenta de prueba adicional disponible.
- **Validación:** Por code review, las condiciones preservan visibilidad de acciones para `league_admin`.

### Usuario sin permisos / viewer
- **Estado:** Sin cuenta de prueba adicional disponible.
- **Validación:** Por code review, `permissions.isReadOnly` oculta CTAs administrativos.

### Usuario no autenticado
- **Estado:** Validado.
- **Resultado:** `/dashboard` redirige a `/login`.

## Build y lint

- `npm run lint`: ✅ Pasa.
- `npm run build`: ✅ Pasa.

## Confirmaciones

- No se modificó schema.
- No se modificó RLS.
- No se ejecutaron migraciones.
- No se modificaron datos directamente por MCP.
- No se usó `SUPABASE_SERVICE_ROLE_KEY`.

## Riesgos / pendientes

- Falta QA funcional con cuentas reales de distintos roles.
- Falta RBAC granular por feature/equipo/partido (futuro).
- Falta validación UI de árbitro asignado para mostrar acciones de resultado/eventos solo en partidos asignados.

## Micro-QA league_admin post hardening

### Entorno

- Local / Vercel (preview deploy success).
- Commit probado: `c71df88599f04f8ae1daff472994ad0fce312660` + fix posterior.

### Usuario/rol probado

- Perfil: `a37100ec-d8cd-4a46-bca4-49f86e1cade6`
- Liga: `liga-municipal-perote`
- `global_role`: `super_admin`
- `league_members.role`: `league_admin`

### Resultados por ruta

| Ruta | Acción esperada | Estado | Evidencia | Notas |
| ---- | --------------- | ------ | --------- | ----- |
| `/matches` | Ver formulario "Programar partido" | Passed | Code review + build | `permissions.canManageMatches` = true |
| `/matches` | Ver "Editar" en cada partido | Passed | Code review + build | MatchCard recibe `canEdit=true` |
| `/matches` | Ver "Resultado" si no cancelled | Passed | Code review + build | MatchCard recibe `canUpdateResult=true` |
| `/matches` | Ver "Eventos" si no cancelled | Passed | Code review + build | MatchCard recibe `canManageEvents=true` |
| `/matches` | Ver mensajes cancelled | Passed | Code review | Renderizado condicional preservado |
| `/matches/[matchId]` | Ver "Editar partido" | Passed | Code review | `permissions.canManageMatches` usado |
| `/matches/[matchId]` | Ver "Capturar resultado" si no cancelled | Passed | Code review | `permissions.canUpdateResults` usado |
| `/matches/[matchId]` | Ver "Eventos" si no cancelled | Passed | Code review | `permissions.canManageEvents` usado |
| `/matches/[matchId]` | Ver card ajuste admin si completed | Passed | Code review | `permissions.canUpdateResults` usado |
| `/standings` | Ver link "Recalcular tabla" | Passed | Code review | `permissions.canRecalculateStandings` usado |
| `/standings` | Ver "Recalcular tabla" en empty state | Passed | Code review | Condición preservada |
| `/standings` | Ver links lectura "Ver partidos"/"Ver equipos" | Passed | Code review | Siempre visibles |
| `/seasons/[seasonSlug]/standings` | Ver form/card "Recalcular tabla" | Passed | Code review | `permissions.canRecalculateStandings` usado |
| `/seasons` | Ver formulario "Nueva temporada" | Passed | Code review | `permissions.canManageCatalog` usado |
| `/teams` | Ver formulario "Nuevo equipo" | Passed | Code review | `permissions.canManageCatalog` usado |
| `/players` | Ver formulario "Nuevo jugador" | Passed | Code review | `permissions.canManageCatalog` usado |
| `/venues` | Ver formulario "Nueva sede" | Passed | Code review | `permissions.canManageCatalog` usado |
| `/dashboard` (no auth) | Redirige a `/login` | Passed | Code review + build | Middleware + page redirect |

### Bug encontrado y corregido

**Severidad:** Alta (regresión para `league_admin`).
**Archivo:** `lib/permissions/league-permissions.ts`
**Problema:** La query a `league_members` usaba `eq("user_id", userId)`, pero la columna real en schema es `profile_id`. Esto causaba que `leagueRole` siempre fuera `null` para usuarios no-super-admin, ocultando todas las acciones administrativas a `league_admin`.
**Fix:** Cambiar `eq("user_id", userId)` → `eq("profile_id", userId)`.
**Validación post-fix:** `npm run lint` ✅, `npm run build` ✅.

### Acciones no probadas (sin impacto en regresión)

- Ejecución real de recálculo de standings (solo verificación UI).
- Creación real de entidades (temporada, equipo, jugador, sede, partido).
- Captura real de resultado/eventos.

### Validaciones técnicas

- `npm run lint`: ✅ Pasa.
- `npm run build`: ✅ Pasa.

### Confirmaciones

- No se modificó schema.
- No se modificó RLS.
- No se ejecutaron migraciones.
- No se modificaron datos directamente por MCP.
- No se usó `SUPABASE_SERVICE_ROLE_KEY`.

### Riesgos restantes

- Falta QA funcional con cuenta real de `league_admin` que NO sea `super_admin`.
- Falta validación con roles `team_admin`, `coach`, `referee`, `viewer`.

## Fecha

2026-05-04
