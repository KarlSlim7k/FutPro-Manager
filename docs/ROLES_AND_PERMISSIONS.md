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
| match_officials                            | Sí (si liga activa/pública)               | Miembros de liga                   | league_admin/super_admin                                                 |
| referee_availabilities                     | No                                        | Árbitro dueño + league_admin/super_admin | Árbitro miembro de la liga o admin de la liga                            |
| user_notifications                         | No                                        | Dueño de la notificación (`user_id`)      | Dueño para update/delete; actor/admin al despachar alertas               |
| players, player_team_registrations         | Parcial (players y registrations en ligas públicas activas) | Miembros de liga                   | league_admin, team_admin y coach según alcance                           |
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
   - `players` permite `SELECT` a `anon` solo cuando el jugador pertenece a una liga pública activa, para soportar el detalle público `/liga/[slug]/players/[playerId]`.
   - Esta lectura pública no habilita escritura y no expone controles administrativos.
5. **Referee y cuerpo arbitral en partidos:** puede actualizar/capturar resultados y eventos si está permitido por liga y cuando está asignado al encuentro (como central, asistente o cuarto oficial en `match_officials`, o en columna heredada `matches.referee_id`); si el partido no tiene árbitro asignado, cualquier `referee` de la liga puede oficiarlo (helper `canOfficiateMatch`).
   En `matches`, un referee no admin queda restringido a cambiar `status`, `home_score` y `away_score`.
6. **Integridad de autoría en eventos:** `match_events.created_by` debe coincidir con el usuario autenticado en inserts y no puede cambiarse en updates (salvo `super_admin`).
7. **Integridad deportiva en eventos:** `team_id` debe estar en el partido; si hay `player_id`, debe existir registro activo del jugador con ese equipo en la temporada del partido.

## Alcance post-MVP

- Auditoría automática mediante triggers SQL / event-bus (Frente 3).
- Media avanzada (crop, resize, avatares, múltiples uploads) y analítica deportiva (Frente 4).


## Hardening UX de permisos en dashboard

- **Objetivo:** evitar que usuarios sin permisos vean acciones administrativas que probablemente no pueden ejecutar, manteniendo RLS/server actions como fuente real de seguridad.
- **Implementación:** helper server-side `getLeaguePermissions` en `lib/permissions/league-permissions.ts`.
- **Reglas UX actuales (RBAC granular v1):**
  - `super_admin` y `league_admin` dentro de su liga: pueden ver todas las acciones administrativas.
  - `team_admin`/`coach` (staff de equipo): pueden crear/editar jugadores, gestionar plantilla de sus equipos y registrar eventos en partidos donde participa su equipo. Sin acceso a gestión de liga, miembros, árbitros ni auditoría.
  - `referee` asignado (`matches.referee_id`): puede capturar resultado y eventos en sus partidos asignados.
  - `viewer` y resto: solo consulta; CTAs administrativas ocultas.
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

- Auditoria automatica via triggers SQL o event bus (sin pasar por server actions).
- Filtros full-text y busqueda avanzada a nivel base de datos.


## Cobertura Operativa de Roles

| Rol | Cobertura | Estado | Capacidades principales |
|---|---|---|---|
| `super_admin` | 100% | Completo | Acceso global a todas las ligas, auditoría global, exportación CSV, gestión de suscripciones, configuración total. |
| `league_admin` | 100% | Completo | Gestión total dentro de su liga: temporadas, equipos, sedes, partidos, resultados, standings, miembros de liga, asignación de árbitros, auditoría de liga, exportación CSV y purga de logs. |
| `team_admin` | 100% | Completo | Gestión de datos y logo de sus equipos, administración de staff de equipo (agregar/roles/remover con guardrail de último admin), gestión de plantilla/roster (inscribir/dorsal/estado/baja), foto de jugadores, captura y eliminación de eventos en sus partidos (filtrado por equipo), y Hub "Mis equipos". |
| `coach` | 100% | Completo | Gestión deportiva integral: alta, edición y foto de jugadores de la liga; inscripción, dorsal, estado y baja en plantilla de sus equipos; registro y eliminación de eventos en partidos donde participa su club; acceso directo en Hub "Mis equipos". Bloqueo estricto de edición de equipo, logo, staff, marcadores y liga. |
| `referee` | 100% | Completo | Gestión arbitral total: designación en partidos, captura y ajuste de resultado (marcador/estado), registro y eliminación de eventos para ambos equipos participantes, consulta e impresión de cédula oficial, filtro por partidos asignados en calendario, y hub "Mis partidos asignados" en dashboard. |
| `viewer` | 100% | Completo | Consulta y lectura permitida por RLS en el dashboard y vistas públicas. |


## Administracion Operativa de Equipos: team_admin (100%)

### Descripcion
El rol `team_admin` cuenta con cobertura operativa del 100%, permitiendo a los administradores de equipo gestionar de forma integral su club, staff, plantilla y participación deportiva sin depender del `league_admin`.

### Capacidades Implementadas
1. **Gestión de Identidad y Datos del Equipo:**
   - Edición de información del equipo: nombre, slug y estado (`/dashboard/leagues/[slug]/teams/[teamSlug]/edit`).
   - Carga y actualización de escudo/logo del equipo (`updateTeamLogoAction`) verificado mediante `canManageTeam`.
2. **Gestión de Staff del Equipo (`/staff`):**
   - Ruta: `/dashboard/leagues/[slug]/teams/[teamSlug]/staff`.
   - Listado de cuerpo técnico con roles asignados (`team_admin`, `coach`).
   - Agregar miembros al staff a partir de usuarios miembros de la liga (`addTeamMemberAction`).
   - Cambio de roles dentro del staff (`updateTeamMemberRoleAction`).
   - Remoción de miembros del staff (`removeTeamMemberAction`).
   - **Guardrail de seguridad:** Protección estricta que impide remover o cambiar el rol al último `team_admin` del equipo.
   - Auditoría: `team.member_added`, `team.member_role_updated`, `team.member_removed`.
3. **Gestión de Plantilla / Roster (`/roster`):**
   - Ruta: `/dashboard/leagues/[slug]/teams/[teamSlug]/roster`.
   - Inscripción de jugadores existentes de la liga a la plantilla de una temporada activa (`registerPlayerAction`).
   - Modificación de estatus de registro (`active`, `inactive`, `suspended`, `transferred`) y número de dorsal (`updatePlayerRegistrationStatusAction`).
   - Baja/remoción de jugadores de la plantilla (`deletePlayerRegistrationAction`).
   - Auditoría: `player.registered_to_team`, `registration.status_updated`, `registration.removed_from_team`.
4. **Gestión de Jugadores:**
   - Alta y edición de jugadores de la liga (`/players/new`, `/players/[playerId]/edit`).
   - Carga y actualización de fotografía de jugadores (`updatePlayerPhotoAction`) con permiso de `canManagePlayers`.
5. **Captura y Gestión de Eventos de Partido (`/events`):**
   - Ruta: `/dashboard/leagues/[slug]/matches/[matchId]/events`.
   - Acceso condicionado a que uno de sus equipos administrados participe en el encuentro (`managedTeamIds`).
   - Selección de equipo en el formulario restringida estrictamente a los equipos que el usuario tiene potestad de gestionar (`allowedTeamIds`).
   - Eliminación de eventos de partido con confirmación (`deleteMatchEventAction`).
   - Auditoría: `match.event_created`, `match.event_deleted`.
6. **Hub Centralizado "Mis Equipos":**
   - Vista en `/dashboard/teams` con sección destacada de "Mis equipos", mostrando insignias de rol (`Administrador de equipo`, `Cuerpo técnico`) y accesos rápidos a Equipo, Plantilla y Staff.
   - Widget dedicado en la página de inicio del dashboard (`/dashboard`) para salto directo a los equipos administrados.

### Guardrails y Arquitectura de Seguridad
- **Autoridad final en RLS:** `can_manage_team(team_id)`, políticas en `teams`, `team_members`, `players`, `player_team_registrations` y `match_events`.
- **Fail-closed:** Si un usuario no es administrador del equipo específico, la interfaz oculta los formularios y los Server Actions abortan inmediatamente retornando error.
- **Sin Service Role:** Todas las mutaciones se ejecutan exclusivamente con el token y cliente autenticado del usuario final.
- **Auditoría best-effort:** Los registros en `audit_logs` se ejecutan sin bloquear ni interrumpir las mutaciones deportivas principales.


## Operación Deportiva: coach (100%)

### Descripción
El rol `coach` (cuerpo técnico / entrenador) alcanza una cobertura operativa del 100% de acuerdo con las facultades permitidas por el modelo de datos y RLS. A diferencia de un `team_admin`, el entrenador no administra la institución (club, logo, cuerpo técnico ni directiva), pero tiene autonomía total en las operaciones deportivas de sus equipos y de los jugadores de la liga.

### Capacidades Deportivas Implementadas (Permitidas)
1. **Gestión de Jugadores de la Liga (`players`):**
   - Alta de nuevos jugadores en la liga (`/dashboard/leagues/[slug]/players` vía `CreatePlayerForm`).
   - Edición de perfiles de jugadores (`/dashboard/leagues/[slug]/players/[playerId]/edit`).
   - Carga y actualización de fotografías de jugadores (`updatePlayerPhotoAction`) avalado por `canManagePlayers`.
2. **Gestión de Plantilla / Roster (`player_team_registrations`):**
   - Inscripción de jugadores a la plantilla de su equipo para temporadas activas (`/teams/[teamSlug]/roster` vía `CreatePlayerRegistrationForm`).
   - Actualización de estatus de registro (`active`, `inactive`, `suspended`, `transferred`) y número de dorsal (`updatePlayerRegistrationStatusAction`).
   - Baja o desvinculación de jugadores de la plantilla (`deletePlayerRegistrationAction`).
   - Verificación estricta en servidor con `isTeamStaff(permissions, team.id)`.
3. **Registro y Gestión de Eventos Deportivos (`match_events`):**
   - Registro de goles, tarjetas, asistencias, penales y eventos durante el partido (`/matches/[matchId]/events` vía `createMatchEventAction`).
   - Selección de equipo en el formulario filtrada exclusivamente a los equipos donde el usuario es staff (`allowedTeamIds`).
   - Eliminación de eventos de partido con confirmación previa y auditoría (`deleteMatchEventAction`).
4. **Hub y Accesos Rápidos "Mis Equipos":**
   - Presencia de sus clubes en `/dashboard/teams` con insignia distintiva "Cuerpo técnico" y links a **Detalle**, **Plantilla** y **Staff**.
   - Widget "Mis equipos" en el inicio del dashboard (`/dashboard`).

### Capacidades Administrativas Restringidas (Bloqueadas por Diseño y RLS)
- **Edición del Equipo (`teams`):** El botón "Editar" no se muestra en el hub, en el listado ni en el detalle del equipo; `updateTeamAction` aborta con error si se intenta invocar.
- **Logo del Equipo (`teams.logo_url`):** El formulario de carga de escudo no se muestra en el detalle del equipo; `updateTeamLogoAction` valida con `canManageTeam`.
- **Cuerpo Técnico (`team_members`):** La página `/staff` se presenta en modo de consulta informativa (sin formularios para agregar o alterar roles ni remover integrantes).
- **Marcador y Resultado de Partido (`matches`):** No tiene acceso a captura de resultado final (reservado para administradores de liga y árbitros asignados).
- **Administración de Liga, Miembros y Auditoría:** Formularios y accesos administrativos permanecen completamente ocultos y fail-closed.


## Operación Arbitral: referee (100%)

### Descripción
El rol `referee` (árbitro oficial) alcanza una cobertura operativa del 100% de acuerdo con las facultades permitidas por el modelo de datos y las políticas RLS. El árbitro tiene control total sobre el acta arbitral de sus partidos asignados (captura de marcador, cambio de estado, registro integral de incidencias disciplinarias para ambos clubes participantes y emisión de cédula oficial física y digital), manteniendo un bloqueo estricto sobre la programación de partidos, asignación de árbitros y administración institucional o deportiva de los clubes.

### Capacidades Arbitrales Implementadas (Permitidas)
1. **Hub Centralizado y Widget "Mis partidos asignados":**
   - Vista en `/dashboard/matches` con la sección destacada "Mis partidos asignados", con insignias de rol (`Árbitro asignado`), estados, sedes, fechas formateadas en `es-MX`, marcadores actuales y accesos directos a **Detalle**, **Resultado**, **Eventos** y **Cédula**.
   - Widget dedicado en la pantalla principal del dashboard (`/dashboard`) para salto directo a los encuentros donde tiene designación arbitral activa.
2. **Captura y Ajuste de Marcador y Estado (`matches`):**
   - Captura de resultado en `/dashboard/leagues/[slug]/matches/[matchId]/result` mediante `MatchResultForm` y `updateMatchResultAction`.
   - Ajuste técnico de marcador y estado en partidos finalizados (`completed`) desde el detalle del partido.
   - Restricción estricta garantizada por RLS (`can_manage_match(id)`) y el trigger de base de datos `ensure_match_update_scope()`, el cual valida que un árbitro solo pueda alterar `home_score`, `away_score` y `status`.
3. **Registro y Gestión de Eventos Deportivos para Ambos Equipos (`match_events`):**
   - Ruta: `/dashboard/leagues/[slug]/matches/[matchId]/events`.
   - A diferencia del cuerpo técnico o administración de un club (cuyo alcance está limitado a su propio equipo), el árbitro asignado cuenta con selector habilitado para ambos equipos participantes (`allowedTeamIds = [home_team_id, away_team_id]`).
   - Registro de goles, autogoles, tarjetas amarillas, tarjetas rojas, asistencias, sustituciones y penales con minuto y notas reglamentarias.
   - Eliminación de eventos con confirmación previa y registro de auditoría (`deleteMatchEventAction`).
4. **Cédula Oficial de Partido (`/cedula`):**
   - Ruta: `/dashboard/leagues/[slug]/matches/[matchId]/cedula`.
   - Formato oficial físico y digital listo para impresión con alineaciones completas por equipo, números de dorsal validados, reporte cronológico de goles, desglose disciplinario de amonestaciones y expulsiones, ficha técnica con cuerpo arbitral completo (central, asistentes y cuarto oficial) y líneas formales de firmas para árbitros y capitanes/delegados.
   - Acceso directo mediante botón "Cédula" en cards de partidos, detalle de encuentro y hubs operativos.
5. **Filtro e Identificación en el Calendario de Liga:**
   - En `/dashboard/leagues/[slug]/matches`, filtro rápido "Solo mis partidos asignados" en `MatchListFilters` para árbitros de la liga.
   - Insignia distintiva visual `Mi partido asignado` en las tarjetas `MatchCard` correspondientes al usuario.
6. **Panel Arbitral en Detalle de Partido y Ternas Arbitrales (`match_officials`):**
   - En `/dashboard/leagues/[slug]/matches/[matchId]`, bloque destacado `Panel arbitral del encuentro` para cualquier árbitro asignado con accesos directos a resultado, eventos y cédula.
   - En la tarjeta `RefereeAssignmentCard`, desglose completo del cuerpo arbitral (Árbitro central, Primer asistente, Segundo asistente, Cuarto oficial) con indicación explícita `(Tú / Designado)` en la posición asignada al usuario actual.
   - Soporte para cuerpo arbitral completo en base de datos (`match_officials`), validación de unicidad para evitar que una misma persona ocupe dos puestos en el mismo encuentro, y sincronización transparente con `matches.referee_id`.
7. **Disponibilidad y Notificaciones Arbitrales (`referee_availabilities` y `user_notifications`):**
   - Gestión de calendario de disponibilidad en el hub de partidos (`/dashboard/matches`) mediante `RefereeAvailabilityManager` para registrar fechas de indisponibilidad con horarios y notas.
   - Detección automática en `RefereeAssignmentForm` para advertir a los administradores si un árbitro seleccionado reportó no estar disponible para la fecha programada.
   - Centro de notificaciones in-app (`NotificationBell`) en el header con avisos automáticos de nuevas designaciones arbitrales, alertas de no leídas y navegación directa al encuentro designado.

### Capacidades Administrativas Restringidas (Bloqueadas por Diseño, Trigger y RLS)
- **Programación y Sede (`matches`):** No puede crear partidos ni eliminarlos (`matches_insert_manage_league`, `matches_delete_manage_league`); la ruta `/matches/[matchId]/edit` valida `canManageMatches` y muestra un aviso fail-closed de acceso restringido; cualquier intento en base de datos es bloqueado por el trigger `ensure_match_update_scope()`.
- **Asignación de Árbitros (`canAssignReferees`):** Solo visible en modo lectura en `RefereeAssignmentCard`; sin acceso al formulario de asignación (`RefereeAssignmentForm`).
- **Administración Institucional y de Clubes:** Sin acceso a edición de ligas, temporadas, equipos, escudos, sedes ni miembros de liga.
- **Gestión de Plantillas y Jugadores:** Sin permisos para crear jugadores o inscribir deportistas a equipos (`canManagePlayers = false`, `canManageRegistrations = false`).
- **Auditoría y Standings:** Sin acceso a la vista de auditoría de liga ni recálculo manual de la tabla general.



