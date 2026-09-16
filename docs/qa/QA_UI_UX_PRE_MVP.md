# QA UI/UX Pre-MVP

## Fecha
2026-05-19

## Commit base
`dfcea05`

## Entorno
- Node.js / Next.js 16.2.4 (Turbopack)
- Linux CI local
- Sin navegador gráfico ni headless disponible — validación: **Code-reviewed only**

---

## Rutas revisadas

### Dashboard
- `/login`
- `/dashboard`
- `/dashboard/leagues`
- `/dashboard/leagues/[slug]`
- `/dashboard/leagues/[slug]/seasons`
- `/dashboard/leagues/[slug]/teams`
- `/dashboard/leagues/[slug]/players`
- `/dashboard/leagues/[slug]/matches`
- `/dashboard/leagues/[slug]/standings`
- `/dashboard/leagues/[slug]/members`
- `/dashboard/leagues/[slug]/audit`

### Vista pública
- `/liga/[slug]`
- `/liga/[slug]/standings`
- `/liga/[slug]/matches`
- `/liga/[slug]/teams/[teamSlug]`
- `/liga/[slug]/players/[playerId]`

---

## Breakpoints evaluados

| Breakpoint | Método |
|---|---|
| mobile 390x844 | Code-reviewed only (sin navegador) |
| tablet 768x1024 | Code-reviewed only (sin navegador) |
| desktop 1440x900 | Code-reviewed only (sin navegador) |

---

## Hallazgos

### Accesibilidad — inputs sin label
| Componente | Issue | Estado |
|---|---|---|
| `components/media/entity-image-upload-form.tsx` | Input `file` sin `<label>` accesible | ✅ Corregido |
| `components/referees/referee-assignment-form.tsx` | `<select>` sin label visible ni `sr-only` | ✅ Corregido |
| `components/members/league-member-role-form.tsx` | `<select>` sin label visible ni `sr-only` | ✅ Corregido |

### Semántica — tabla de standings
| Componente | Issue | Estado |
|---|---|---|
| `components/standings/standings-table-view.tsx` | `<th>` sin `scope="col"` | ✅ Corregido |
| `components/standings/standings-table-view.tsx` | Headers abreviados (PJ, G, E, P, GF, GC, DG, PTS) sin `title` descriptivo | ✅ Corregido |

### Consistencia visual — botones one-off
| Componente | Issue | Estado |
|---|---|---|
| `components/media/entity-image-upload-form.tsx` | Botón submit con clases Tailwind one-off (no usa `Button` component) | ✅ Corregido |
| `components/referees/referee-assignment-form.tsx` | Botón submit con clases Tailwind one-off | ✅ Corregido |
| `components/members/league-member-role-form.tsx` | Botón submit con clases Tailwind one-off | ✅ Corregido |

### Formularios — help text
| Componente | Issue | Estado |
|---|---|---|
| `components/players/create-player-form.tsx` | Campo `photo_url` sin indicación de que el upload de media es la vía preferida | ✅ Corregido (help text añadido) |

---

## Verificaciones OK (sin cambios necesarios)

### Responsive
- Dashboard layout: sidebar mobile con nav horizontal `overflow-x-auto` → OK.
- `standings-table-view`: envuelto en `overflow-x-auto` + fallback mobile con `StandingMobileCard` → OK.
- Grids con breakpoints progresivos (`sm`, `md`, `xl`, `lg`) en todas las páginas principales → OK.
- Cards con padding y separación balanceados en mobile → OK.
- `ToolbarActions` en stack para mobile donde aplica → OK.

### Semántica y headings
- Jerarquía correcta: `PageHeader` emite `h1`, `SectionHeader`/`CardTitle` emiten `h2`/`h3` → OK.
- `DashboardSidebar` usa `h2` para el título del sidebar (dentro de `<aside>`, no compite con el `h1` del main) → OK.

### Accesibilidad — focus
- `Button` component: `focus-visible:ring-2 focus-visible:ring-offset-2` → OK.
- `Input` component: `focus-visible:ring-2 focus-visible:ring-emerald-700` → OK.
- `TextLink`: `focus-visible:outline-none focus-visible:ring-2` → OK.
- Tabs de `PublicNav`: `focus-visible:ring-2 focus-visible:ring-emerald-700` → OK.
- Links en `DashboardSidebar`: `focus-visible:ring-2 focus-visible:ring-emerald-400` → OK.

### Formularios principales
- `login-form.tsx`: labels, pending states, error messages → OK.
- `create-match-form.tsx`: labels en todos los campos, pending state, error por campo y global → OK.
- `create-match-event-form.tsx`: labels, pending state, errors → OK.
- `update-match-result-form.tsx`: labels, pending state, success/error messages, warning de standings → OK.
- `edit-team-form.tsx`, `edit-player-form.tsx`: labels, errors → OK (validado por presencia de código similar).
- `create-season-form.tsx`, `create-player-registration-form.tsx`: patrón consistente → OK.

### Vista pública
- `PublicNav`: sin CTAs administrativas, solo Resumen / Tabla de posiciones / Partidos → OK.
- `/liga/[slug]`: consulta solo ligas `is_public=true && status=active` → OK.
- `PublicLeagueHeader`: muestra logo/nombre sin acciones admin → OK.
- `/liga/[slug]/players/[playerId]`: carga sin sesión tras policy pública mínima → OK (validado en PR previo `1c1fb58`).
- Empty states presentes en todas las rutas públicas cuando no hay datos → OK.

### Permisos visuales
- `EntityImageUploadForm` solo renderiza si `permissions.canManageLeague` → OK.
- `CreateMatchForm` solo renderiza si `permissions.canManageMatches` → OK.
- `RefereeAssignmentForm` envuelta en comprobación de `permissions.canAssignReferees` → OK.
- `LeagueMembersTable` muestra controles de rol solo si `permissions.canManageRoles` → OK.
- Vista de auditoría (`/audit`) solo accesible para `super_admin` y `league_admin` → OK.
- Members page muestra Card informativa sin controles para usuarios sin permisos → OK.

---

## Fixes aplicados

| Archivo | Cambio |
|---|---|
| `components/media/entity-image-upload-form.tsx` | Label `htmlFor="entity-image-input"` añadido al input file; botón `<button>` reemplazado por `<Button size="sm" />` |
| `components/referees/referee-assignment-form.tsx` | Label `sr-only` añadido al select; botón reemplazado por `<Button size="sm" />`; `disabled` propagado al select durante `isPending` |
| `components/members/league-member-role-form.tsx` | Label `sr-only` con id dinámico por miembro añadido al select; botón reemplazado por `<Button size="sm" />`; `disabled` propagado al select durante `isPending` |
| `components/standings/standings-table-view.tsx` | `scope="col"` en todos los `<th>`; `title` descriptivo en PJ, G, E, P, GF, GC, DG, PTS |
| `components/players/create-player-form.tsx` | Help text añadido al campo `photo_url` sugiriendo usar media upload desde el detalle del jugador |

---

## Pendientes

| Pendiente | Prioridad |
|---|---|
| QA manual cross-browser real (Chrome, Safari, Firefox) en mobile y desktop | Post-MVP |
| QA funcional multi-cuenta (league_admin vs viewer vs sin acceso) con segunda cuenta real | Post-MVP |
| E2E automatizado (Playwright o similar) sobre flujos críticos | Post-MVP |
| Visual regression tests | Post-MVP |
| Validación responsive con navegador gráfico o headless real (390x844, 768x1024, 1440x900) | Post-MVP |

---

## Resultado final

- `npm run lint`: ✅ 0 errores
- `npm run build`: ✅ compilación exitosa — 34 rutas generadas
- Regresiones visuales detectadas en code review: **ninguna**
- Formularios principales: labels / help text / error messages / pending states → razonables para MVP
- Responsive mobile: sin overflow crítico detectado en code review
- Vistas públicas: sin controles admin expuestos
- Dashboard: permisos visuales correctos por rol

**Veredicto UI/UX Fase 4 y Fase 5: Cerradas para MVP con pendientes explícitos documentados.**
