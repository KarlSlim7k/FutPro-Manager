# DATABASE

## Resumen

El schema inicial vive en `supabase/migrations/0001_initial_schema.sql` y está diseñado para un modelo multi-tenant por liga dentro de una sola app.

Principios del diseño:

- UUID como PK en tablas de dominio.
- Integración con `auth.users` mediante `profiles`.
- RLS habilitado en todas las tablas de negocio.
- Políticas iniciales simples (MVP) con helpers SQL reutilizables.
- Estructura lista para crecimiento (suscripciones, auditoría y media metadata).

## Entidades principales

### Identidad y acceso

- `profiles`: perfil de usuario autenticado, rol global y datos básicos.
- `league_members`: membresía de usuario por liga y rol dentro de la liga.
- `team_members`: membresía de usuario por equipo y rol operativo.

### Núcleo deportivo

- `leagues`: organización principal (liga) con visibilidad pública y estado.
- `seasons`: temporadas por liga.
- `teams`: equipos por liga.
- `players`: jugadores por liga.
- `player_team_registrations`: registro de jugador por equipo/temporada.
- `venues`: sedes/canchas por liga.
- `matches`: partidos por liga/temporada, incluyendo asignación opcional de árbitro (`referee_id`).
- `match_events`: eventos deportivos por partido.
- `standings`: tabla de posiciones por temporada y equipo.

### Operación y crecimiento

- `media_uploads`: metadata de archivos subidos a Storage.
- `audit_logs`: auditoría básica por entidad.
- `subscription_plans`: catálogo de planes (sin pagos implementados).
- `league_subscriptions`: estado de suscripción por liga (preparación futura).

## Relaciones clave

- `profiles.id` -> `auth.users.id`.
- `leagues.created_by` -> `profiles.id`.
- `league_members` relaciona usuario-liga.
- `team_members` relaciona usuario-equipo.
- `seasons`, `teams`, `players`, `venues`, `matches`, `standings` cuelgan de `league_id`.
- `player_team_registrations` conecta `players`, `teams`, `seasons` con validación de consistencia por trigger.
- `match_events` depende de `matches` y opcionalmente `teams`/`players`.
- `league_subscriptions` enlaza `leagues` con `subscription_plans`.

## Triggers y funciones

- `set_updated_at()`: actualiza `updated_at` en tablas con trigger `before update`.
- `handle_new_auth_user()`: crea `profiles` automáticamente al alta en `auth.users`.
- `handle_new_league_membership()`: agrega al creador de la liga como `league_admin`.
- `ensure_profile_role_protection()`: evita escalamiento de privilegios en `profiles.global_role`.
- `ensure_player_registration_consistency()`: obliga misma liga entre jugador/equipo/temporada.
- `ensure_match_consistency()`: obliga consistencia de liga entre partido, equipos, temporada y sede.

## Índices relevantes

Incluye índices para filtros frecuentes:

- Slugs: `leagues.slug` (índice único por constraint), `teams.slug`.
- Filtros por liga/temporada: `teams.league_id`, `seasons.league_id`, `matches.league_id`, `matches.season_id`.
- Agenda: `matches.scheduled_at`.
- Plantillas: `player_team_registrations.player_id`, `player_team_registrations.team_id`.
- Posiciones: `standings.season_id`, `standings.team_id`.
- Membresías: `league_members.profile_id`, `team_members.profile_id`.

## RLS inicial (resumen)

### Datos públicos (lectura `anon` + `authenticated`)

- `leagues`, `seasons`, `teams`, `venues`, `matches`, `match_events`, `standings`.
- Solo cuando la liga está `is_public = true` y `status = 'active'`.

### Datos autenticados (lectura/escritura según rol)

- `profiles`, `league_members`, `team_members`, `players`, `player_team_registrations`, `media_uploads`, `audit_logs`, `league_subscriptions`.
- Escritura gobernada por helpers (`is_super_admin`, `can_manage_league`, `can_manage_team`, `can_manage_match`).
- En `match_events`, escritura endurecida: `created_by` debe coincidir con `auth.uid()`, el `team_id` debe participar en el partido y, si hay `player_id`, debe existir registro activo del jugador para ese equipo/temporada.
- En `matches`, un referee no administrador solo puede modificar `status` y marcadores; no puede alterar estructura del partido.

### Datos de planes

- `subscription_plans`: lectura pública solo de planes activos; gestión por `super_admin`.

## Pendiente para fases futuras

- Módulo de cobros/pagos y sincronización con proveedor externo.
- Asignaciones formales de árbitros por partido (tabla dedicada).
- Generación automática de standings desde eventos/resultados.
- Políticas de media pública/privada por tipo de entidad.

## Bootstrap seguro inicial

- La migración incluye backfill de `profiles` para usuarios ya existentes en `auth.users` antes de activar el trigger de altas nuevas.
- Cualquier usuario autenticado puede crear su liga inicial con `created_by = auth.uid()`; el trigger lo agrega como `league_admin`.
- El primer `super_admin` **no** se autoasigna. Debe configurarse manualmente con SQL administrativo controlado:

```sql
update public.profiles
set global_role = 'super_admin'
where id = '<USER_UUID>';
```

## Aplicación de migración (cuando se apruebe)

1. **Supabase SQL Editor:** ejecutar el contenido de `supabase/migrations/0001_initial_schema.sql`.
2. **Supabase CLI:**
   1. `supabase link --project-ref <PROJECT_REF>`
   2. `supabase db push`

No usar `service_role` en frontend; mantenerlo solo en entornos server-side confiables.
