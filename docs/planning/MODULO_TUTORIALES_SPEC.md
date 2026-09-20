# Módulo Tutoriales por Rol — SPEC Funcional (MVP)

> **Para agentes IA:** este es el documento de verdad funcional. Si hay conflicto con otros docs, este manda para el módulo Tutoriales. Leer primero, luego `docs/architecture/MODULO_TUTORIALES_ARCHITECTURE.md` y `docs/prompts/MODULO_TUTORIALES_PROMPTS.md`.

## 1. Objetivo

Ayuda contextual por rol dentro del dashboard: paso a paso, flujos de trabajo, FAQ y gif/video corto por proceso. Reducir tickets de soporte y errores operativos (cédula, resultado, convocatoria, registro).

## 2. Alcance MVP (2-3 días dev)

**Incluye:**
- Ruta `/dashboard/ayuda` (lista + detalle). Filtra automáticamente por rol efectivo del usuario.
- Contenido gestionado en DB (`tutorials` + `tutorial_steps`), no hardcodeado en TSX.
- 5-7 tutoriales por rol crítico, resto iterativo.
- Soporte Markdown para pasos + FAQ JSON + 1 media (gif/mp4/webp, max 8MB) por paso.
- Reutiliza bucket `league-media` existente (prefijo `tutorials/`), sin bucket nuevo.
- Búsqueda por título + filtro por rol + filtro por etiqueta.

**No incluye (post-MVP):**
- LMS, quizzes, progreso gamificado, certificaciones.
- Reproductor custom, streaming, subtítulos multi-idioma.
- Editor WYSIWYG admin (MVP usa SQL/seed + form admin simple si sobra tiempo).
- PWA offline dedicado de tutoriales.

## 3. Roles y tutoriales semilla (mínimo viable)

| Rol | Slug sugerido | Flujo cubierto | Ruta app que documenta |
|---|---|---|---|
| `league_admin` | `liga-crear-temporada` | Crear temporada + fixture | `/dashboard/leagues/[slug]/seasons` |
| `league_admin` | `liga-asignar-arbitro` | Asignar terna arbitral | `.../matches/[matchId]` + `RefereeAssignmentForm` |
| `league_admin` | `liga-recalcular-standings` | Recalcular tabla | `.../standings` |
| `team_admin` | `equipo-gestionar-roster` | Inscribir/dorsal/baja | `.../teams/[teamSlug]/roster` |
| `team_admin` | `equipo-gestionar-staff` | Agregar/cambiar rol staff | `.../teams/[teamSlug]/staff` |
| `coach` | `coach-registrar-evento` | Registrar gol/tarjeta en partido | `.../matches/[matchId]/events` |
| `coach` | `coach-convocar-plantilla` | Convocatoria (callups) | `.../teams/[teamSlug]/callups` |
| `referee` | `arbitro-capturar-resultado` | Capturar marcador/estado | `.../matches/[matchId]/result` |
| `referee` | `arbitro-emitir-cedula` | Emitir cédula oficial | `.../matches/[matchId]/cedula` |
| `referee` | `arbitro-modo-cancha` | Modo Cancha en celular | `GUIA_ARBITRAJE.md` + vista móvil |
| `super_admin` | `plataforma-broadcast` | Avisos masivos | `/dashboard/notifications/broadcast` |
| `viewer` | `explorar-liga-publica` | Explorar portal público | `/liga/[slug]` |

Cada tutorial semilla: 4-8 pasos, 3-5 FAQs, 1 gif por pasos clave (max 3 gifs por tutorial en MVP).

## 4. Modelo de visibilidad

- `viewer`: solo tutoriales `viewer` + públicos.
- `coach`/`team_admin`: sus tutoriales + `viewer`.
- `referee`: sus tutoriales + `viewer`.
- `league_admin`: todos los de su liga + `viewer`.
- `super_admin`: todo.
- Resolución de rol: reutilizar `getLeaguePermissions` (`lib/permissions/league-permissions.ts`). No crear sistema de roles paralelo. Si `leagueId` no disponible (ruta global `/dashboard/ayuda`), usar `profiles.global_role` + `league_members` más reciente; fail-closed a `viewer`.

## 5. Criterios de aceptación MVP (Implementado y Verificado)

1. [x] **Usuario sin sesión → redirect `/login`**: Validado en `app/dashboard/ayuda/page.tsx` y `[slug]/page.tsx` con `supabase.auth.getUser()`.
2. [x] **`/dashboard/ayuda` carga < 2s con 50 tutoriales**: Limit 50 y `order("sort_order")` en `lib/tutorials/queries.ts`.
3. [x] **Filtro por rol muestra solo tutoriales permitidos**: Aislamiento RLS en Postgres + filtrado estricto en servidor con `getVisibleRolesForUser` / `getGlobalVisibleRoles`. Tests vitest en `lib/tutorials/queries.test.ts`.
4. [x] **Detalle `/dashboard/ayuda/[slug]`**: Renderiza pasos Markdown sanitizado (`ReactMarkdown` JSX puro sin `dangerouslySetInnerHTML`), FAQ acordeón (`TutorialFaq`), media con `next/image` y `<video controls preload="metadata">`. Si no está autorizado o no existe → `notFound()` fail-closed.
5. [x] **`npm run lint`, `npm test`, `npm run build` en verde**: Verificado (0 errores de ESLint, 160 tests vitest en verde, build Next.js 16 exitoso).
6. [x] **Sin `SUPABASE_SERVICE_ROLE_KEY` en app. RLS fail-closed**: Verificado con grep en `lib/tutorials/`, `app/dashboard/ayuda/`, `components/help/`.
7. [x] **Docs actualizados**: `IMPLEMENTATION_STATUS.md` y este spec actualizados con evidencia verídica.

## 6. Backlog post-MVP (no hacer ahora)

- `tutorial_progress` (visto/completado por usuario).
- Feedback útil/no útil + analytics.
- Versionado de tutoriales por release.
- Admin UI CRUD completo en `/dashboard/ayuda/admin`.

## 7. Fuentes para el contenido inicial

Los pasos deben derivarse de evidencia real, no inventarse:
- `docs/user-guide/GUIA_ADMIN_LIGA.md`, `GUIA_EQUIPOS.md`, `GUIA_ARBITRAJE.md`, `GUIA_ADMIN_PLATAFORMA.md`, `PORTAL_PUBLICO.md`, `PRIMEROS_PASOS.md`.
- Rutas reales en `app/dashboard/` y componentes en `components/`.
- Matriz RBAC en `docs/architecture/ROLES_AND_PERMISSIONS.md`.

## 8. Archivos que este módulo debe tocar/crear

Ver detalle técnico en `docs/architecture/MODULO_TUTORIALES_ARCHITECTURE.md` y pasos en `docs/developer/MODULO_TUTORIALES_IMPLEMENTATION.md`. Resumen: 1 migración SQL, 2 rutas app, 3-4 componentes en `components/help/`, 1 lib `lib/tutorials/`, 1 seed SQL, tipos en `types/database.ts`.
