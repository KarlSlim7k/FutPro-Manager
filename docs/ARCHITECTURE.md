# Architecture

## Resumen

FutPro Manager usa una arquitectura web full-stack sobre Next.js (App Router) y Supabase. La app renderiza páginas server-side para dashboard, valida sesión autenticada por request y consume Supabase PostgreSQL con autorización delegada en RLS. El modelo es multi-liga (multi-tenant lógico) dentro de una sola aplicación.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Supabase RLS
- Vercel

## Estructura de carpetas

- `app/`: rutas y páginas (públicas, auth y dashboard).
- `components/`: componentes por dominio y componentes compartidos.
- `components/ui/`: sistema UI reutilizable (`PageHeader`, `SectionHeader`, `EmptyState`, etc.).
- `components/standings/`: componentes específicos de tabla de posiciones.
- `lib/`: utilidades y clientes Supabase (`client`, `server`, env).
- `types/`: tipos TypeScript derivados del modelo de datos.
- `docs/`: documentación técnica y operativa.
- `supabase/`: migraciones y definición del schema.

## Modelo de rutas

### Rutas públicas

- `/` (landing pública)

### Rutas de auth

- `/login`

### Rutas protegidas de dashboard

- `/dashboard`
- `/dashboard/leagues`
- `/dashboard/leagues/[slug]`

### Rutas dinámicas por liga

- `/dashboard/leagues/[slug]/seasons`
- `/dashboard/leagues/[slug]/teams`
- `/dashboard/leagues/[slug]/players`
- `/dashboard/leagues/[slug]/venues`
- `/dashboard/leagues/[slug]/matches`
- `/dashboard/leagues/[slug]/standings`
- y subrutas de detalle/edición/eventos/resultado por entidad.

## Capa de datos

- Se utiliza cliente de Supabase en servidor (`lib/supabase/server.ts`) para páginas y server actions.
- Las consultas se ejecutan con el usuario autenticado (contexto de sesión), no con service role en frontend.
- RLS define autorización real de lectura/escritura por tabla.
- Tipos de `types/database.ts` modelan entidades de dominio y favorecen tipado consistente con Supabase.

## Multi-tenancy

- Modelo multi-liga en una sola base de datos.
- La mayoría de entidades se segmentan por `league_id`.
- El acceso se controla por membresías (`league_members`, `team_members`) + RLS.
- El slug de liga (`[slug]`) se usa para navegación y resolución contextual.

## UI Architecture

- Se priorizan componentes reutilizables y consistencia visual.
- Patrones documentados en `docs/DESIGN.md`.
- Enfoque mobile-first con layouts adaptativos.
- Uso recurrente de cards, headers de página/sección, empty states y links de acción textual.

## Módulo de standings

Arquitectura actual:

1. Página server-side por liga (`/dashboard/leagues/[slug]/standings`).
2. Resolución de liga por `slug`.
3. Consulta de temporadas de la liga.
4. Selección de temporada por `seasonId` (querystring) o fallback a la más reciente.
5. Consulta de `standings` por `league_id + season_id`.
6. Resolución de equipos (`teams`) para etiquetar filas.
7. Ordenamiento final por puntos, diferencia, goles a favor y nombre.
8. Render dual para desktop/mobile (`standings-table-view` y `standing-mobile-card`).
9. Ruta adicional de temporada con recálculo manual (`/seasons/[seasonSlug]/standings`).
10. Utilidad server-side compartida de recálculo que se reutiliza tanto en el botón manual como en el guardado de resultado de partido.
11. Recalculo automático al guardar resultados que entran/salen de estado `completed` (por temporada).

Pendiente:

- Automatización avanzada por eventos, auditoría de recalculos y jobs/background para cargas mayores.

## Decisiones técnicas importantes

- App Router con server components para páginas de dashboard.
- Control de sesión en borde/ruta protegida vía `proxy.ts` y validaciones de usuario en páginas.
- Supabase como backend principal (Auth + Postgres + RLS).
- Documentación separada por dominio (`DATABASE`, `DESIGN`, `ROLES`, `RULES`, `IMPLEMENTATION_STATUS`).

## No-go / restricciones

- No tocar schema sin aprobación.
- No tocar RLS sin aprobación.
- No ejecutar migraciones sin aprobación.
- No usar service role key en frontend.
