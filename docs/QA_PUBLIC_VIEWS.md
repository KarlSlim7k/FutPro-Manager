# QA - Public Views

## Alcance

Validación de la primera versión de vistas públicas para aficionados (`/liga/*`).

## Rutas inspeccionadas

- `/` — Landing page (link a liga pública agregado)
- `/liga/[slug]` — Resumen público de liga
- `/liga/[slug]/standings` — Tabla de posiciones pública
- `/liga/[slug]/matches` — Calendario de partidos público
- `/dashboard/leagues/[slug]/standings` — Regresión dashboard (componentes compartidos)
- `/dashboard/leagues/[slug]/matches` — Regresión dashboard

## Validaciones ejecutadas

### Lint y build
- ✅ `npm run lint` — 0 errores, 0 warnings.
- ✅ `npm run build` — Compilación y generación de páginas estáticas exitosa.

### Seguridad y acceso
- ✅ Las rutas públicas no llaman `supabase.auth.getUser()`.
- ✅ Las rutas públicas filtran ligas por `is_public = true` y `status = 'active'`.
- ✅ Si la liga no existe o no es pública, se invoca `notFound()`.
- ✅ Dashboard privado sigue protegido con redirección a `/login`.

### UI pública
- ✅ No se muestran acciones administrativas en standings público (sin "Recalcular tabla", sin links a dashboard).
- ✅ No se muestran acciones administrativas en matches público (sin "Editar", "Resultado", "Eventos").
- ✅ Vista mobile de standings usa `StandingMobileCard` con basePath público.
- ✅ Vista desktop de standings usa `StandingsTableView` con basePath público.
- ✅ Selector de temporada en standings y matches apunta a rutas públicas (`/liga`).
- ✅ Empty states presentes cuando no hay temporadas, standings o partidos.
- ✅ Metadata dinámica básica por página pública.
- ✅ Conteos de equipos y partidos en `/liga/[slug]` leen `count` de Supabase (corrige `head: true` devolviendo 0).
- ✅ Nombres de equipo en standings público se muestran como texto plano (sin link) porque la ruta pública de equipo no existe todavía.

### Navegación
- ✅ Landing tiene link a `/liga/liga-municipal-perote`.
- ✅ Navegación pública (`PublicNav`) con tabs: Resumen, Tabla, Partidos.
- ✅ Redirección en standings si `seasonId` es inválido.

### Responsive
- ✅ Layouts con `max-w-5xl` y padding responsive.
- ✅ Grids adaptativos (`sm:grid-cols-2`, `lg:grid-cols-3`, `md:grid-cols-2`).
- ✅ Tabla de standings oculta en mobile, cards visibles.

### Reutilización de componentes
- ✅ `StandingMobileCard`, `StandingsTableView`, `StandingsSeasonSelector`, `MatchSeasonSelector` aceptan `basePath` opcional sin romper dashboard.
- ✅ `PublicMatchCard` creado como versión pública sin acciones admin.
- ✅ `StandingMobileCard` y `StandingsTableView` aceptan `enableTeamLinks` opcional (default `true`), desactivado en público y activo en dashboard.

## Limitaciones / Pendientes

- No se validó con datos reales de Supabase/RLS por entorno local; la validación depende de que RLS permita lectura pública para `is_public = true` y `status = 'active'`.
- Filtro por `status` en matches público está implementado por query param pero no expuesto como UI de selector (requerimiento no solicitado en esta fase).
- Pendiente: pruebas E2E con navegador real.

## Confirmaciones

- ✅ No se modificó schema.
- ✅ No se modificó RLS.
- ✅ No se ejecutaron migraciones.
- ✅ No se modificaron datos directamente por MCP.
- ✅ No se usó `SUPABASE_SERVICE_ROLE_KEY`.
- ✅ Supabase MCP se mantuvo en read-only.

## Fecha

2026-05-04
