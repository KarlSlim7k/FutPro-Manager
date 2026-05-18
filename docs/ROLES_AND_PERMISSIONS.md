# ROLES AND PERMISSIONS

## Roles del sistema

- `super_admin`: administración global del sistema.
- `league_admin`: administración completa de una liga.
- `team_admin`: administración operativa de su equipo.
- `coach`: captura/actualización deportiva permitida para su equipo.
- `referee`: captura de resultado/eventos en partidos permitidos.
- `viewer`: solo consulta.

## Niveles de rol

- **Global:** `profiles.global_role` (actualmente usado para `super_admin` y `viewer`).
- **Por liga:** `league_members.role`.
- **Por equipo:** `team_members.role`.

## Matriz base de acceso (MVP)

| Recurso                                    | Lectura pública                           | Lectura autenticada                | Escritura                                                                |
| ------------------------------------------ | ----------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| profiles                                   | No                                        | Dueño + super_admin                | Dueño (campos básicos) + super_admin                                     |
| leagues                                    | Sí (si liga activa/pública)               | Miembros de liga                   | Creador al insertar; admin de liga/super_admin al actualizar             |
| league_members                             | No                                        | Miembros de liga                   | league_admin/super_admin                                                 |
| seasons, teams, venues, matches, standings | Sí (si liga activa/pública)               | Miembros de liga                   | league_admin/super_admin                                                 |
| team_members                               | No                                        | Integrantes y miembros autorizados | team_admin/league_admin/super_admin                                      |
| players, player_team_registrations         | Parcial (registrations en ligas públicas) | Miembros de liga                   | league_admin, team_admin y coach según alcance                           |
| match_events                               | Sí (si liga activa/pública)               | Miembros de liga                   | league_admin/super_admin, referee permitido, team_admin/coach del equipo (solo si su equipo participa en el partido) |
| media_uploads                              | No                                        | Miembros de liga                   | Propietario de upload o admin de liga                                    |
| audit_logs                                 | No                                        | league_admin de la liga            | Insert por actor autenticado; lectura total super_admin                  |
| subscription_plans                         | Sí (planes activos)                       | Sí                                 | super_admin                                                              |
| league_subscriptions                       | No                                        | Miembros de liga                   | super_admin                                                              |

## Reglas RLS iniciales

1. **Mínimo privilegio:** cada tabla tiene políticas explícitas.
2. **Helper functions reutilizables:** `can_access_league`, `can_manage_league`, `can_manage_team`, `can_manage_match`.
3. **Protección anti-escalamiento:** trigger evita que un usuario cambie su `global_role`.
4. **Lectura pública controlada:** solo ligas `active` y `is_public = true`.
5. **Referee en partidos:** puede actualizar/capturar resultados y eventos si está permitido por liga y, si existe asignación, cuando es el árbitro asignado (`matches.referee_id`).
   En `matches`, un referee no admin queda restringido a cambiar `status`, `home_score` y `away_score`.
6. **Integridad de autoría en eventos:** `match_events.created_by` debe coincidir con el usuario autenticado en inserts y no puede cambiarse en updates (salvo `super_admin`).
7. **Integridad deportiva en eventos:** `team_id` debe estar en el partido; si hay `player_id`, debe existir registro activo del jugador con ese equipo en la temporada del partido.

## Alcance pendiente (no implementado en esta fase)

- Permisos granulares por acción/módulo (RBAC detallado por feature).
- Tabla de asignaciones de árbitro con historial.
- Roles de staff adicionales.
- Jerarquía avanzada de permisos por torneo/categoría.


## Hardening UX de permisos en dashboard

- **Objetivo:** evitar que usuarios sin permisos vean acciones administrativas que probablemente no pueden ejecutar, manteniendo RLS/server actions como fuente real de seguridad.
- **Implementación:** helper server-side `getLeaguePermissions` en `lib/permissions/league-permissions.ts`.
- **Reglas UX actuales (MVP conservador):**
  - `super_admin` y `league_admin` dentro de su liga: pueden ver todas las acciones administrativas.
  - Otros roles (`team_admin`, `coach`, `referee`, `viewer`, sin rol): solo consulta; CTAs administrativas ocultas.
- **Qué se oculta:** formularios de creación (temporadas, equipos, jugadores, sedes, partidos), links de edición de partido, captura de resultado/eventos, recálculo manual de standings, ajuste administrativo de resultado.
- **Qué sigue visible:** listados, detalles, navegación de lectura permitida por RLS.
- **Autoridad final:** RLS y server actions siguen siendo la autoridad de seguridad. Este cambio es puramente de UX/visibilidad.

## Nota de alcance UI vs schema

El modelo de roles/permisos está definido en schema + RLS, pero algunas capacidades avanzadas pueden existir primero a nivel de base de datos y no necesariamente tener aún una pantalla administrativa completa en UI.


## Administracion UI de miembros por liga (Fase 6A)

### Ruta

`/dashboard/leagues/[slug]/members`

### Quien puede administrar

- `super_admin` (acceso global a todas las ligas).
- `league_admin` (solo dentro de su liga).

### Roles asignables desde UI

- `league_admin`
- `team_admin`
- `coach`
- `referee`
- `viewer`

### Restricciones y guardrails

1. **No se permite asignar `super_admin` desde la UI de liga.** El rol `super_admin` se gestiona exclusivamente a nivel de base de datos/schema.
2. **No se permite dejar la liga sin al menos un `league_admin`.** Si el miembro objetivo es el ultimo `league_admin` de la liga, la operacion se rechaza con mensaje de error.
3. **No se usa `SUPABASE_SERVICE_ROLE_KEY`.** Todas las operaciones se ejecutan con el cliente autenticado del usuario.
4. **RLS y server actions siguen siendo la autoridad final de seguridad.** La UI refleja permisos pero no los reemplaza.
5. **Si RLS impide la operacion, se muestra error controlado** sin exponer detalles internos.

### Flags de permisos nuevos

En `lib/permissions/league-permissions.ts`:

- `canManageMembers`: `true` para `super_admin` o `league_admin` dentro de la liga. Controla la visibilidad de la tabla con controles de edicion.
- `canManageRoles`: `true` para `super_admin` o `league_admin` dentro de la liga. Controla la visibilidad del formulario de cambio de rol por miembro.

### Comportamiento para usuarios sin permisos de administracion

Usuarios con roles distintos a `super_admin`/`league_admin` pueden acceder a la ruta `/dashboard/leagues/[slug]/members` pero ven la pagina en modo informativo: se muestra un Card explicativo indicando que no tienen permisos para administrar miembros, sin formularios ni controles de edicion.

### Archivos implementados

- `app/dashboard/leagues/[slug]/members/page.tsx` - Pagina principal de administracion de miembros.
- `app/dashboard/leagues/[slug]/members/actions.ts` - Server action para cambio de rol.
- `components/members/role-badge.tsx` - Badge visual por rol.
- `components/members/league-members-table.tsx` - Tabla/cards responsive de miembros.
- `components/members/league-member-role-form.tsx` - Formulario de cambio de rol (client component).


## Asignacion basica de arbitros a partidos (Fase 6B)

### Descripcion

Asignacion y remocion de un arbitro a un partido desde el detalle del partido en el dashboard. El arbitro asignado se muestra tanto en el detalle como en el listado de partidos.

### Quien puede asignar

- `super_admin` (acceso global a todas las ligas).
- `league_admin` (solo dentro de su liga).

### Roles que pueden ser asignados como arbitro

- `referee` (miembro de la liga con rol referee).
- `league_admin` (miembro de la liga con rol league_admin).

### Flags de permisos

En `lib/permissions/league-permissions.ts`:

- `canAssignReferees`: `true` para `super_admin` o `league_admin`. Controla visibilidad del formulario de asignacion.
- `canViewRefereeAssignments`: `true` para cualquier usuario autenticado con acceso a la liga (leagueRole no es null o globalRole es super_admin).

### Restricciones y guardrails

1. **Solo miembros de la liga con rol `referee` o `league_admin` pueden ser asignados.** Se valida membresia y rol antes de actualizar.
2. **Si se envia valor vacio o "none", se remueve la asignacion** (referee_id se pone en null).
3. **No se usa `SUPABASE_SERVICE_ROLE_KEY`.** Todas las operaciones se ejecutan con el cliente autenticado del usuario.
4. **No se modifican migraciones, schema ni RLS.** La columna `matches.referee_id` ya existe en el schema.
5. **RLS y server actions siguen siendo la autoridad final de seguridad.**
6. **Si RLS impide la operacion, se muestra error controlado** (codigo 42501 o mensaje de row-level security).

### Comportamiento UI

- **Detalle de partido:** tarjeta "Arbitro" muestra nombre del arbitro asignado o "Sin arbitro asignado". Si el usuario tiene `canAssignReferees`, se muestra formulario de seleccion/asignacion.
- **Listado de partidos:** cada tarjeta muestra "Arbitro: {nombre}" o "Sin arbitro" debajo de la sede.

### Archivos implementados

- `app/dashboard/leagues/[slug]/matches/[matchId]/referee/actions.ts` - Server action para asignar/quitar arbitro.
- `components/referees/referee-assignment-form.tsx` - Formulario de asignacion (client component).
- `components/referees/referee-assignment-card.tsx` - Tarjeta de visualizacion de arbitro (server component).
- `app/dashboard/leagues/[slug]/matches/[matchId]/page.tsx` - Detalle de partido (integra tarjeta y formulario).
- `app/dashboard/leagues/[slug]/matches/page.tsx` - Listado de partidos (muestra nombre de arbitro en cards).
- `components/matches/match-card.tsx` - Card de partido (muestra linea de arbitro).

### Pendiente post-MVP

- Tabla de asignaciones de arbitros con historial (auditar quien asigno, cuando, cambios).
- Soporte multi-arbitro (arbitro principal, asistentes).
- Calendario de disponibilidad de arbitros.
- Notificaciones al arbitro asignado.


## Auditoria visible en UI (Fase 6C)

### Ruta

`/dashboard/leagues/[slug]/audit`

### Quien puede ver

- `super_admin` (acceso global a todas las ligas).
- `league_admin` (solo dentro de su liga).

### Flags de permisos nuevos

En `lib/permissions/league-permissions.ts`:

- `canViewAuditLogs`: `true` para `super_admin` o `league_admin`. Controla visibilidad de la pagina y del card en el dashboard de liga.
- `canManageAuditLogs`: `true` para `super_admin` o `league_admin`. Reservado para futura gestion avanzada (actualmente igual a `canViewAuditLogs`).

### Filtros disponibles

Filtros via query params: `action`, `entityType`, `actorId` (UUID validado), `from` y `to` (fecha YYYY-MM-DD). Valores invalidos se ignoran sin crash.

### Guardrails

1. **Sin cambios a schema, RLS ni migraciones.** La tabla `audit_logs` ya existe en el schema inicial.
2. **Sin service role.** Todas las operaciones usan el cliente autenticado del usuario.
3. **Audit log best-effort.** Si la insercion falla (por RLS u otro error), la accion principal continua y retorna su resultado normal.
4. **RLS sigue siendo la autoridad final.** Solo el actor autenticado puede insertar (`actor_id = auth.uid()`); solo `super_admin` o `league_admin` pueden leer via `can_manage_league`.
5. **Si RLS impide leer `audit_logs`, se muestra empty state seguro** sin exponer detalles del error.
6. **Actor sin perfil legible:** fallback `Usuario <id corta>`.

### Acciones auditadas inicialmente

- `member.role_updated` (via `updateMemberRoleAction` en `app/dashboard/leagues/[slug]/members/actions.ts`)
- `match.referee_updated` (via `updateMatchRefereeAction` en `app/dashboard/leagues/[slug]/matches/[matchId]/referee/actions.ts`)
- `match.referee_removed` (via `updateMatchRefereeAction` cuando se remueve el arbitro)

### Pendientes post-MVP

- Instrumentacion exhaustiva de todos los server actions.
- Auditoria automatica via triggers SQL o event bus (sin pasar por server actions).
- Auditoria global para `super_admin` (multi-liga).
- Exportacion CSV/PDF.
- Retencion avanzada y politicas de limpieza.
- Filtros full-text y busqueda avanzada.
