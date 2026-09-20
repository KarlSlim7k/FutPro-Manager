# Guía para Desarrolladores · FutPro Manager

Onboarding técnico para contribuir al código de FutPro Manager. Complementa —no reemplaza— la referencia técnica profunda:

* [Arquitectura](../architecture/ARCHITECTURE.md) · [Base de datos](../architecture/DATABASE.md) · [Infraestructura](../architecture/INFRASTRUCTURE.md) · [Roles y permisos](../architecture/ROLES_AND_PERMISSIONS.md) · [Storage](../architecture/STORAGE_SETUP.md)
* [Reglas de código](../guidelines/RULES.md) · [Sistema de diseño](../guidelines/DESIGN.md)

---

## 1. Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js (App Router) + React + TypeScript |
| Estilos | Tailwind CSS v4 + componentes propios (patrón shadcn/ui) |
| Formularios | react-hook-form + zod |
| Backend | Server Components + Server Actions (sin API routes de negocio) |
| Base de datos | Supabase PostgreSQL con RLS en todas las tablas de negocio |
| Auth | Supabase Auth (`auth.users` + tabla `profiles`) |
| Storage | Supabase Storage (bucket `league-media`) |
| Testing | Vitest + jsdom |
| Deploy | Vercel |

## 2. Setup local

```bash
git clone https://github.com/KarlSlim7k/FutPro-Manager.git
cd FutPro-Manager
npm install
cp .env.example .env.local   # completar credenciales
npm run dev                  # http://localhost:3000
```

### Variables de entorno

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (requerida) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave anónima/publishable (requerida) |
| `NEXT_PUBLIC_SITE_URL` | URL base pública (metadata, OpenGraph) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Correo público de contacto/soporte |
| `NEXT_PUBLIC_CDN_DOMAIN` | Opcional: dominio CDN para media (`resolveCdnMediaUrl`) |

> ⚠️ Nunca usar `SUPABASE_SERVICE_ROLE_KEY` en la app: todas las mutaciones se ejecutan con el cliente autenticado del usuario (RLS es la autoridad final). No subir `.env.local` a git.

### Base de datos

* Migraciones en `supabase/migrations/` (numeradas cronológicamente). La inicial es `0001_initial_schema.sql`.
* Aplicar migraciones con Supabase CLI (`supabase db push` o `supabase migration up` en el entorno correspondiente).
* Para probar con datos: `supabase/migrations/20260916090000_tercertiempo_seed.sql` (seed de liga de demostración).
* El primer `super_admin` se asigna **por SQL administrativo** sobre `profiles.global_role`.

## 3. Estructura del repositorio

```txt
app/                    # Rutas (App Router)
  page.tsx              #   Portada pública
  explorar/ contactos/  #   Explorador de ligas, contacto, legales
  liga/[slug]/          #   Portal público: standings, stats, matches, teams, players
  login/ update-password/
  dashboard/            #   Panel autenticado (multi-módulo, ver §4)
components/             # Componentes por dominio (matches/, teams/, standings/, audit/…)
  ui/                   #   Primitivos reutilizables (Button, Card, PageHeader…)
lib/                    # Lógica de dominio
  supabase/             #   Clientes server/browser
  permissions/          #   Helpers RBAC (league-permissions, match-permissions)
  audit/                #   Instrumentación de auditoría best-effort
  media/                #   Upload, procesamiento de imagen y tests
  stats/                #   Estadísticas agregadas y tests
supabase/migrations/    # SQL versionado (schema, RLS, triggers, seeds)
types/database.ts       # Tipos generados del schema
docs/                   # Documentación (ver docs/README.md)
```

## 4. Mapa de módulos del dashboard

| Ruta | Módulo | Acceso |
|---|---|---|
| `/dashboard` | Inicio: KPIs, tendencias, widgets por rol | Autenticado |
| `/dashboard/leagues` (+ `new`, `admin`) | CRUD de ligas; `admin` = ciclo de vida global | league_admin / super_admin |
| `/dashboard/leagues/[slug]/seasons` | Temporadas por liga | league_admin |
| `…/teams` (+ `staff`, `roster`, `edit`) | Equipos, staff y plantilla | league_admin / team_admin / coach |
| `…/players` (+ `edit`, `registrations`) | Jugadores e inscripciones | league_admin / team_admin / coach |
| `…/venues` | Sedes | league_admin |
| `…/matches` (+ `result`, `events`, `cedula`, `referee`) | Partidos, resultados, eventos, cédula, designaciones | league_admin / referee / staff |
| `…/standings` | Tabla + recálculo manual e historial | league_admin |
| `…/members`, `…/audit`, `…/media` | Miembros, auditoría y multimedia por liga | league_admin |
| `/dashboard/matches` | Hub "Mis partidos asignados" (árbitro) + calendario | referee y demás |
| `/dashboard/teams`, `/dashboard/players` | Hubs de selección de liga + "Mis equipos" | staff |
| `/dashboard/profile` | Perfil, avatar y datos personales | Todos |
| `/dashboard/audit` | Auditoría global + export CSV | super_admin |
| `/dashboard/users` | Directorio y administración de usuarios | super_admin |
| `/dashboard/storage` | Gestión global de archivos | super_admin |
| `/dashboard/subscriptions` | Planes y suscripciones (licenciamiento manual) | super_admin |
| `/dashboard/notifications/broadcast` | Avisos globales por rol | super_admin |
| `/dashboard/contact-messages` | Bandeja del formulario público | super_admin |
| `/dashboard/types` | Referencia de catálogos | Autenticado |

## 5. Patrones clave (leer antes de codificar)

1. **Server Components por defecto.** Client Components solo para interacción (`"use client"`). Mutaciones **exclusivamente vía Server Actions** (`actions.ts` junto a la ruta).
2. **Permisos:** resuelve capacidades con `getLeaguePermissions` (`lib/permissions/league-permissions.ts`) y helpers de match; la UI **oculta** lo no permitido (fail-closed) y la server action **aborta** si se invoca sin permiso. RLS es la autoridad final.
3. **Auditoría best-effort:** usa `createAuditLog` (`lib/audit/`). Un fallo de auditoría nunca bloquea la operación de negocio. Catálogo de acciones en `AUDIT_ACTION_OPTIONS`. Además existen triggers SQL automáticos (`trg_auto_audit_log`) en `matches`, `match_events`, `match_officials`, `team_members` y `player_team_registrations`.
4. **Tipos:** todo dato de negocio tipado desde `types/database.ts`. No inventar shapes.
5. **Validación:** formularios con react-hook-form + zod; entradas de query params validadas server-side (allowlists; valores inválidos se ignoran sin crash).
6. **Media:** uploads con recorte client-side (`cropAndResizeImage`) y presets por entidad (1:1 logos/avatares, 3:4 jugadores); URLs resueltas con `resolveCdnMediaUrl`.
7. **Fechas/moneda:** formatear con `Intl.DateTimeFormat("es-MX", …)`.
8. **Sin service role, sin overengineering:** ver [RULES.md](../guidelines/RULES.md).

## 6. Calidad: comandos

```bash
npm run lint        # ESLint (debe pasar en verde antes de PR)
npm test            # Suite Vitest (run)
npm run test:watch  # Modo watch
npm run build       # Compila y valida tipos TypeScript
```

Convenciones de PR (resumen): una intención por PR, tests para lógica de dominio en `lib/`, sin commits directos a `main`, actualizar documentación afectada (ver checklist en [RULES.md](../guidelines/RULES.md)).

## 7. Despliegue

* **Vercel** conectado al repo `main`; variables de entorno configuradas en el proyecto.
* **Supabase**: proyecto cloud con migraciones aplicadas; Storage bucket `league-media` con políticas (ver [STORAGE_SETUP.md](../architecture/STORAGE_SETUP.md)).
* Vista pública con ISR/SSG: cuidar el comportamiento de revalidación al tocar rutas `liga/[slug]` (`revalidatePath` desde server actions).

## 8. Referencia rápida de seguridad

| Mecanismo | Dónde |
|---|---|
| RLS por tabla + helpers (`can_access_league`, `can_manage_league`, `can_manage_team`, `can_manage_match`) | `supabase/migrations/*` |
| Anti-escalamiento de `global_role` (trigger) | migración inicial |
| Restricción de scope de árbitro (`ensure_match_update_scope`) | migración `20260916071500` |
| Sincronización terna ↔ `matches.referee_id` (`sync_match_head_referee`) | migración `20260916065658` |
| Auditoría automática (`trg_auto_audit_log`) | migración `20260916073000` |
| Protección de logs de auditoría | migración `20260917010000` |
| RPCs de administración (usuarios, storage, media) | migraciones `2026091712/13/140000` |
