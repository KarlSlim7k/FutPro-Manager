# Módulo Tutoriales — Prompts y Mapa para Agentes IA

> Copiar-pegar estos prompts tal cual. Están calibrados a este repo (Next.js App Router + Supabase RLS + RBAC existente).

## 1. Mapa: dónde buscar qué

| Necesito… | Buscar en… |
|---|---|
| Roles y qué puede cada rol | `docs/architecture/ROLES_AND_PERMISSIONS.md`, `types/database.ts` (AppRole), `lib/permissions/league-permissions.ts` |
| Pasos reales de cada flujo | `docs/user-guide/GUIA_ADMIN_LIGA.md`, `GUIA_EQUIPOS.md`, `GUIA_ARBITRAJE.md`, `GUIA_ADMIN_PLATAFORMA.md`, `PORTAL_PUBLICO.md` |
| Rutas reales (no inventar) | `app/dashboard/**` (glob `app/**/page.tsx`), `components/` |
| Patrón Server Action + permisos + auditoría | `docs/developer/DEVELOPER_GUIDE.md` §5, `app/dashboard/leagues/[slug]/members/actions.ts` |
| Storage y uploads | `docs/architecture/STORAGE_SETUP.md`, `lib/media/` |
| Reglas que no romper | `docs/guidelines/RULES.md`, `docs/guidelines/DESIGN.md` |
| Estado del producto | `docs/planning/IMPLEMENTATION_STATUS.md`, `docs/prompts/AI_CONTEXT.md` |
| Spec + arquitectura tutoriales | `docs/planning/MODULO_TUTORIALES_SPEC.md`, `docs/architecture/MODULO_TUTORIALES_ARCHITECTURE.md`, `docs/developer/MODULO_TUTORIALES_IMPLEMENTATION.md` |

**Regla de oro:** inspeccionar `app/`, `components/`, `lib/`, `supabase/migrations/` reales antes de concluir. No asumir implementado solo porque existe en schema.

## 2. Prompt A — Crear schema + migración

```
Contexto: FutPro Manager (Next.js + Supabase, RLS fail-closed, sin service role en app).
Lee: docs/planning/MODULO_TUTORIALES_SPEC.md, docs/architecture/MODULO_TUTORIALES_ARCHITECTURE.md,
supabase/migrations/0001_initial_schema.sql (helpers can_manage_league), types/database.ts.

Tarea: crea supabase/migrations/<timestamp>_tutorials.sql con tablas tutorials + tutorial_steps,
índices GIN, RLS enable, policies select authenticated (is_published=true) y escritura solo
league_admin/super_admin reutilizando helpers existentes. No modifiques tablas existentes.
No uses SUPABASE_SERVICE_ROLE_KEY. Devuelve el SQL + qué policies reutilizaste y por qué.
Valida con: npm run build.
```

## 3. Prompt B — Implementar rutas + lib

```
Lee: docs/developer/MODULO_TUTORIALES_IMPLEMENTATION.md (Fases 2-4),
lib/permissions/league-permissions.ts, app/dashboard/layout.tsx, components/ui/*.

Tarea: implementa lib/tutorials/queries.ts + roles.ts, app/dashboard/ayuda/page.tsx y
app/dashboard/ayuda/[slug]/page.tsx, components/help/*. Sigue patrones: Server Components
por defecto, "use client" solo en filtros/acordeón, valida searchParams con allowlist,
fail-closed por rol, Markdown sanitizado, reutiliza PageHeader/Card/EmptyState.
Reporta archivos creados/modificados y ejecuta npm run lint && npm test && npm run build.
```

## 4. Prompt C — Generar contenido semilla por rol

```
Lee: docs/user-guide/GUIA_ARBITRAJE.md (o GUIA_EQUIPOS/GUIA_ADMIN_LIGA según rol),
docs/architecture/ROLES_AND_PERMISSIONS.md, docs/guidelines/MODULO_TUTORIALES_CONTENT_GUIDE.md.

Tarea: genera el seed SQL del tutorial '<slug>' para rol '<rol>': 4-8 pasos con título,
body_md (con ruta real de la app, ej. /dashboard/leagues/[slug]/matches/[matchId]/result),
3-5 FAQs [{q,a}], tags, estimated_minutes, related_route existente (verifica con glob
app/**/page.tsx). No inventes rutas ni botones. Media_path en null. Tono español MX, imperativo.
```

## 5. Prompt D — QA del módulo

```
Lee: docs/qa/MODULO_TUTORIALES_QA_CHECKLIST.md, supabase/seed_test_users_by_role.sql.
Tarea: verifica /dashboard/ayuda por cada rol (super_admin, league_admin, team_admin, coach,
referee, viewer): visibilidad correcta, searchParams inválidos no crashean, media carga con
alt, Markdown sin XSS, lint/test/build verdes. Reporta tabla rol × resultado + issues.
```

## 6. Guardrails para el agente (pegar en system prompt)

- Prohibido: service role en app, modificar RLS/schema existente sin instrucción, hardcodear contenido en TSX, `dangerouslySetInnerHTML` sin sanitizar, marcar implementado sin evidencia.
- Obligatorio: leer archivos reales, cambios mínimos, reportar archivos + validaciones (`npm run lint`, `npm test`, `npm run build`).
