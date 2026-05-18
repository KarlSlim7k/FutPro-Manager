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
