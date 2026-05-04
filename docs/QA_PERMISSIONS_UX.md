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

## Fecha

2026-05-04
