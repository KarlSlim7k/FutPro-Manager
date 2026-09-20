# Módulo Tutoriales — Arquitectura Técnica

> **Para agentes IA:** referencia técnica autoritativa. Leer `docs/planning/MODULO_TUTORIALES_SPEC.md` antes. Inspeccionar archivos reales citados antes de codificar (regla `docs/guidelines/RULES.md`).

## 1. Decisión de diseño

Contenido en **DB (Supabase Postgres)**, no en MDX hardcodeado. Motivo: filtrado por rol, búsqueda, reordenamiento y actualización sin deploy. Markdown se guarda como texto y se renderiza server-side sanitizado.

## 2. Schema propuesto (1 migración nueva)

```sql
-- supabase/migrations/20YYYYMMDDHHMMSS_tutorials.sql
create table tutorials (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                    -- ej. 'arbitro-capturar-resultado'
  title text not null,
  summary text not null,
  target_roles text[] not null default '{viewer}',  -- subset de AppRole
  tags text[] not null default '{}',
  estimated_minutes int not null default 5,
  sort_order int not null default 100,
  is_published boolean not null default true,
  related_route text null,                       -- ej. '/dashboard/leagues/[slug]/matches/[matchId]/result'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table tutorial_steps (
  id uuid primary key default gen_random_uuid(),
  tutorial_id uuid not null references tutorials(id) on delete cascade,
  step_order int not null,
  title text not null,
  body_md text not null,                         -- Markdown limitado (ver guía contenido)
  media_path text null,                          -- path en bucket league-media: 'tutorials/<slug>/paso-N.webp'
  media_type text null check (media_type in ('gif','video','image')),
  faq jsonb not null default '[]',               -- [{q:string, a:string}] a nivel paso, o vacío
  unique(tutorial_id, step_order)
);

create index idx_tutorials_roles on tutorials using gin (target_roles);
create index idx_tutorials_published_sort on tutorials (is_published, sort_order);
```

- Añadir tipos TS en `types/database.ts`: `Tutorial`, `TutorialStep`.
- FAQ global por tutorial: usar `tutorial_steps.faq` del paso 1 o fila `step_order=0` tipo `faq`. Alternativa simple MVP: columna `faq jsonb` en `tutorials`. **Recomendado MVP:** FAQ a nivel tutorial (`tutorials.faq jsonb`), pasos sin faq para simplificar. Elegir una y documentar en PR.

## 3. RLS (fail-closed, sin service role)

```sql
alter table tutorials enable row level security;
alter table tutorial_steps enable row level security;

-- Lectura: publicados para cualquier autenticado; filtrado fino por rol se hace en server action con allowlist.
create policy "tutorials_select_authenticated"
  on tutorials for select to authenticated using (is_published = true);

create policy "tutorial_steps_select_authenticated"
  on tutorial_steps for select to authenticated using (
    exists (select 1 from tutorials t where t.id = tutorial_steps.tutorial_id and t.is_published = true)
  );

-- Escritura MVP: solo super_admin y league_admin (reutilizar helpers existentes can_manage_league).
-- Si helpers no cubren tabla nueva, crear policy con exists sobre league_members/profiles equivalente a can_manage_league.
-- No crear policies de escritura pública/anon.
```

Ver helpers reales en `supabase/migrations/0001_initial_schema.sql` (`can_access_league`, `can_manage_league`). No inventar funciones nuevas sin leerlas.

## 4. Storage (reutilizar `league-media`)

- Sin bucket nuevo. Prefijo: `tutorials/<tutorial-slug>/paso-<N>.<ext>`.
- Formatos: `webp`/`gif` para loops cortos (<15s), `mp4` (H.264) para demos >15s. Max 8MB por archivo.
- Subida solo autenticada bajo `tutorials/%` (extender policy existente o añadir policy análoga a `STORAGE_SETUP.md`). Lectura pública OK (tutoriales no sensibles).
- Resolver URLs con `resolveCdnMediaUrl` existente (`lib/media/`). No hardcodear `supabase.co` URLs.

Referencia: `docs/architecture/STORAGE_SETUP.md`.

## 5. Rutas y componentes

```
app/dashboard/ayuda/page.tsx          # Server Component: lista + searchParams (q, rol, tag)
app/dashboard/ayuda/[slug]/page.tsx   # Server Component: detalle (pasos + FAQ + media)
app/dashboard/ayuda/actions.ts        # Server Actions: getTutorials(opts), getTutorialBySlug(slug)
components/help/TutorialCard.tsx      # Card (Client mínimo o Server)
components/help/TutorialFilters.tsx   # "use client": search + select rol/tag
components/help/TutorialStepView.tsx  # Render paso: Markdown sanitizado + media
components/help/TutorialFaq.tsx       # Acordeón FAQ
lib/tutorials/queries.ts              # Queries Supabase + filtrado por rol + validación query params
lib/tutorials/roles.ts                # target_roles allowlist + mapeo getLeaguePermissions → roles visibles
```

Patrones obligatorios (ver `docs/developer/DEVELOPER_GUIDE.md` §5):
- Server Components por defecto; `"use client"` solo en filtros/acordeón/video.
- Mutaciones solo vía Server Actions (en MVP solo lectura; escritura admin post-MVP).
- Permisos: `getLeaguePermissions` en `lib/permissions/league-permissions.ts` para resolver visibilidad; RLS como autoridad final; UI fail-closed.
- Validar `searchParams` con allowlist (`q` string ≤100, `rol` ∈ AppRole, `tag` ∈ lista seed); inválidos se ignoran sin crash.
- Markdown: render con librería ya instalada si existe, si no `marked` + `sanitize-html` o `react-markdown`. No `dangerouslySetInnerHTML` sin sanitizar.
- UI: reutilizar `PageHeader`, `Card`, `EmptyState`, `StatusBadge`, `TextLink` de `components/ui/`. Mobile-first, `focus-visible`.

## 6. Queries tipo

```ts
// lib/tutorials/queries.ts (esbozo)
import { createClient } from "@/lib/supabase/server";
export async function getTutorials({ q, role, tag }: { q?: string; role?: AppRole; tag?: string }) {
  const supabase = await createClient();
  let query = supabase.from("tutorials").select("*").eq("is_published", true).order("sort_order").limit(50);
  if (role) query = query.contains("target_roles", [role]);
  if (tag) query = query.contains("tags", [tag]);
  if (q) query = query.ilike("title", `%${q.slice(0, 100)}%`);
  // ...
}
```

## 7. Seed inicial

- `supabase/migrations/<timestamp>_tutorials_seed.sql` o archivo `supabase/seeds/tutorials.sql` con los 12 tutoriales de `MODULO_TUTORIALES_SPEC.md` §3 (títulos, summaries, tags, pasos 4-8, FAQs). Contenido redactado desde `docs/user-guide/*.md` (no inventar rutas).
- Media inicial: placeholders vacíos (`media_path = null`); gifs se suben después vía Dashboard Storage.

## 8. Qué leer antes de tocar código (orden)

1. `types/database.ts` (AppRole)
2. `lib/permissions/league-permissions.ts` + `lib/permissions/match-permissions.ts`
3. `docs/architecture/ROLES_AND_PERMISSIONS.md` (cobertura por rol)
4. `docs/architecture/DATABASE.md` + migración `0001_initial_schema.sql` (helpers RLS)
5. `docs/architecture/STORAGE_SETUP.md` + `lib/media/`
6. `app/dashboard/layout.tsx` + `app/dashboard/page.tsx` (patrón dashboard/widgets por rol)
7. `docs/user-guide/GUIA_ARBITRAJE.md` etc. (contenido real de pasos)
8. `docs/guidelines/RULES.md` + `docs/guidelines/DESIGN.md`
