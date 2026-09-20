# Módulo Tutoriales — Guía de Implementación (para devs y agentes IA)

> Orden de lectura: `docs/planning/MODULO_TUTORIALES_SPEC.md` → `docs/architecture/MODULO_TUTORIALES_ARCHITECTURE.md` → este archivo. No codificar sin haber leído los dos anteriores.

## Fase 0 — Verificación previa (15 min)

```bash
ls supabase/migrations | tail -5
npm run lint && npm test
```

Leer: `types/database.ts`, `lib/permissions/league-permissions.ts`, `app/dashboard/layout.tsx`.

## Fase 1 — Migración DB (hacer primero)

1. Crear `supabase/migrations/YYYYMMDDHHMMSS_tutorials.sql` con el schema de `MODULO_TUTORIALES_ARCHITECTURE.md` §2-3.
2. Reglas: no modificar tablas existentes; no usar service role; RLS enable + policies select autenticado.
3. Validar SQL localmente si hay Supabase CLI; si no, revisión manual + `npm run build`.

## Fase 2 — Tipos + lib

1. Añadir a `types/database.ts`: `Tutorial`, `TutorialStep` (ver architecture doc).
2. Crear `lib/tutorials/queries.ts` + `lib/tutorials/roles.ts`:
   - `getVisibleRolesForUser(permissions)` mapea `LeaguePermissions` → `AppRole[]`.
   - `getTutorials({q, role, tag})`, `getTutorialBySlug(slug)` con cliente server, `limit(50)`, allowlist de params.
3. Test Vitest en `lib/tutorials/queries.test.ts` para filtrado por rol y sanitización de `q` (mock supabase como en `lib/permissions/*.test.ts`).

## Fase 3 — Rutas UI

1. `app/dashboard/ayuda/page.tsx` (Server): lee `searchParams`, resuelve permisos, llama `getTutorials`, renderiza `TutorialFilters` + grid `TutorialCard` + `EmptyState` si 0.
2. `app/dashboard/ayuda/[slug]/page.tsx` (Server): `getTutorialBySlug`, `notFound()` si null o no publicado o rol no permitido; renderiza pasos con `TutorialStepView` + `TutorialFaq`.
3. Añadir link "Ayuda / Tutoriales" en navegación dashboard (buscar componente nav en `app/dashboard/layout.tsx` o `components/`).
4. Añadir widget contextual: en detalle partido/roster mostrar `TextLink` → tutorial relacionado (`related_route` inverso).

## Fase 4 — Componentes (`components/help/`)

- Reutilizar `components/ui/*` (Card, PageHeader, EmptyState, Badge). No crear estilos one-off.
- `TutorialFilters.tsx` único `"use client"` (search input + selects). Resto Server.
- Media: `next/image` para gif/webp, `<video controls preload="metadata">` para mp4. `alt` descriptivo siempre.

## Fase 5 — Seed contenido

1. Crear seed con 12 tutoriales de SPEC §3. Cada body_md redactado desde `docs/user-guide/*.md` (citar ruta real, ej. "Ve a Partidos → [slug] → Resultado").
2. `media_path = null` inicialmente. Subir gifs después a `league-media/tutorials/...`.

## Fase 6 — Verificación (obligatorio reportar)

```bash
npm run lint
npm test
npm run build
```

Manual: login con cada rol (ver `supabase/seed_test_users_by_role.sql`), visitar `/dashboard/ayuda`, filtrar por rol, abrir 1 tutorial por rol, comprobar que no se ven tutoriales de rol superior. Actualizar `docs/planning/IMPLEMENTATION_STATUS.md` solo con evidencia.

## Errores comunes (no cometer)

- Hardcodear tutoriales en TSX en vez de DB.
- Crear bucket nuevo o usar service role.
- `dangerouslySetInnerHTML` sin sanitizar Markdown.
- Inventar rutas de la app que no existen (verificar en `app/dashboard/`).
- Marcar implementado sin `lint/test/build` en verde.
