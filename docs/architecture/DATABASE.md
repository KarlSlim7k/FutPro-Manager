# Base de Datos · FutPro Manager

## Resumen

El esquema de base de datos vive en `supabase/migrations/` organizado cronológicamente. La base inicial se encuentra en `0001_initial_schema.sql` y ha sido enriquecida mediante migraciones incrementales para soportar ternas arbitrales completas, notificaciones, auditoría automática SQL, mejoras multimedia y procedimientos remotos (RPCs) administrativos para la consola de super administración.

### Principios del diseño:
- UUID v4 como clave primaria (PK) en todas las tablas de dominio.
- Integración nativa con `auth.users` mediante la tabla `profiles`.
- RLS (Row Level Security) habilitado en el 100% de las tablas de negocio con políticas fail-closed.
- Funciones de seguridad reutilizables (`can_access_league`, `can_manage_league`, `can_manage_team`, `can_manage_match`, `is_super_admin`).
- Procedimientos almacenados (`SECURITY DEFINER`) con revocación explícita a `public`/`anon` para operaciones administrativas críticas.

---

## Entidades del Sistema

### 1. Identidad y Acceso
- `profiles`: Perfil de usuario autenticado (`id` -> `auth.users.id`), nombre para mostrar, nombre completo, teléfono, avatar (`avatar_url`), rol global (`global_role`: `super_admin` o `viewer`) y bandera de bloqueo (`is_suspended`).
- `league_members`: Membresía por liga (`league_id`, `profile_id`, `role`: `league_admin`, `referee`, `viewer`).
- `team_members`: Membresía por club (`team_id`, `profile_id`, `role`: `team_admin`, `coach`).

### 2. Núcleo Deportivo
- `leagues`: Ligas deportivas con `slug` único, ubicación, estado (`draft`, `active`, `inactive`, `archived`) e indicador de visibilidad pública (`is_public`).
- `seasons`: Temporadas por liga con fechas de inicio y fin, y estado operativo.
- `teams`: Clubes registrados por liga con nombre, slug, logo (`logo_url`) y estado.
- `players`: Futbolistas registrados por liga con nombre, dorsal preferido, posición, pie dominante y fotografía.
- `player_team_registrations`: Inscripciones formales de jugadores en un club para una temporada específica con validación de consistencia de liga.
- `venues`: Canchas y sedes deportivas asociadas a una liga.
- `matches`: Partidos programados con liga, temporada, equipos local/visitante, sede, fecha/hora, marcador (`home_score`, `away_score`), estado (`scheduled`, `live`, `completed`, `postponed`, `cancelled`) y compatibilidad con `referee_id`.
- `match_officials`: Designación formal de la terna arbitral completa (`head_referee`, `first_assistant`, `second_assistant`, `fourth_official`) con sincronización bidireccional hacia `matches.referee_id`.
- `referee_availabilities`: Registro de fechas y rangos horarios de indisponibilidad arbitral.
- `match_events`: Incidencias deportivas por partido (goles, autogoles, tarjetas amarillas/rojas, sustituciones y penales) con minuto, notas reglamentarias y autoría estricta.
- `standings`: Tabla de posiciones consolidada por temporada y equipo (PJ, PG, PE, PP, GF, GC, DG, PTS, forma reciente W/D/L).

### 3. Operación, Plataforma y Auditoría
- `media_uploads`: Metadatos de archivos multimedia en el bucket de Supabase Storage `league-media` (`league_id` nullable para avatares y recursos globales).
- `audit_logs`: Registro histórico inmutable de eventos y mutaciones del sistema con actor (`auth.uid()`), liga, tipo de entidad, acción y payload JSON estructurado.
- `user_notifications`: Sistema in-app de avisos para usuarios (designaciones de partidos, comunicados de plataforma, estado de cuenta).
- `contact_messages`: Mensajes recibidos desde el formulario de contacto público con datos de contacto, liga de interés y notas.
- `subscription_plans`: Catálogo de planes comerciales de la plataforma.
- `league_subscriptions`: Estado de suscripción y licenciamiento de cada liga (`trialing`, `active`, `past_due`, `paused`).

---

## Funciones, Triggers y RPCs

### Triggers de Integridad y Automatización:
- `set_updated_at()`: Mantiene actualizado `updated_at` en mutaciones.
- `handle_new_auth_user()`: Crea automáticamente el registro en `profiles` tras el alta en `auth.users`.
- `handle_new_league_membership()`: Asigna automáticamente al creador de una liga como su primer `league_admin`.
- `ensure_profile_role_protection()`: Impide que usuarios normales alteren su propio `global_role`.
- `ensure_player_registration_consistency()`: Valida que jugador, equipo y temporada pertenezcan estrictamente a la misma liga.
- `ensure_match_consistency()`: Verifica consistencia geográfica y de liga entre equipos, sede y temporada.
- `ensure_match_update_scope()`: Restringe a los árbitros a modificar únicamente el marcador y estado del partido, impidiendo alterar la programación o sedes.
- `sync_match_head_referee()`: Sincroniza bidireccionalmente el árbitro central de `match_officials` con la columna heredada `matches.referee_id`.
- `trg_auto_audit_log()`: Trigger PostgreSQL con `SECURITY DEFINER` que registra mutaciones en `audit_logs` de forma fail-safe y non-blocking en tablas críticas.

### Procedimientos Remotos Administrativos (RPCs para `super_admin`):
- `admin_list_users(search, role_filter, limit, offset)`: Directorio de usuarios con correos de `auth.users`, membresías y último inicio de sesión.
- `admin_set_global_role(target_user_id, new_role)`: Modifica el rol global de un usuario impidiendo degradar al único `super_admin`.
- `admin_set_user_suspension(target_user_id, suspended, reason)`: Suspende o rehabilita una cuenta impidiendo suspender al último super admin activo.
- `admin_assign_super_admin(target_user_id)`: Promueve a un usuario a super administrador con doble guardrail y registro de auditoría dedicado.
- `admin_storage_stats()`: Retorna volumen de almacenamiento ocupado y número de objetos por bucket.
- `admin_list_storage_objects(search_path, limit, offset)`: Explora objetos en el bucket `league-media`.
- `admin_delete_storage_object(object_path)`: Elimina físicamente un archivo de storage con registro de auditoría `storage.object_deleted`.
- `admin_audit_stats()` y `admin_purge_audit_logs(days_to_keep)`: Métricas de volumen de auditoría y purga por retención (90/180/365 días).
- `admin_contact_message_stats()` y `admin_purge_contact_messages(days_to_keep)`: Conteo y depuración de mensajes antiguos de contacto.

---

## Modelo de Seguridad RLS

1. **Lectura Pública (`anon` + `authenticated`):**
   - Ligas, temporadas, equipos, sedes, partidos, eventos, estadísticas y tabla de posiciones pertenecientes a ligas activas con `is_public = true`.
   - Fichas públicas de jugadores (`players`) restringidas a campos no sensibles (nombre, posición, foto, número).
   - Inserción anónima en `contact_messages` para recepción de prospectos.

2. **Lectura Privada:**
   - `profiles`, `league_members`, `team_members`, `audit_logs`, `referee_availabilities`, `user_notifications`, `league_subscriptions`.

3. **Escritura y Mutación:**
   - Estrictamente controlada por helpers de permisos en cascada (`can_manage_league`, `can_manage_team`, `can_manage_match`, `is_super_admin`).
   - Los árbitros solo pueden mutar resultados y eventos de encuentros donde participan en la terna o en partidos sin asignación.
   - El staff del equipo solo puede capturar y eliminar eventos para su respectivo club.

---

## Inicialización Segura (Bootstrap)

El primer `super_admin` del sistema debe inicializarse mediante SQL administrativo directo en la consola de base de datos:

```sql
update public.profiles
set global_role = 'super_admin'
where id = '<USER_UUID>';
```

Una vez creado el primer super administrador, la plataforma permite promover a nuevos administradores de forma segura desde la interfaz en `/dashboard/users` mediante una frase de confirmación obligatoria.
