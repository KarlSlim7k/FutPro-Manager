# QA - Responsive and Permissions

## Contexto

Ejecución de mini fase de QA enfocada en:

1. Responsive visual real en mobile / tablet / desktop.
2. Validación de permisos multi-rol desde UI.
3. Documentar resultados y aplicar solo fixes menores.

No se agregaron features nuevas ni se modificó schema/RLS.

## Entorno

- **Commit base:** `c4df8abe82f0e15f2f611e47aa39b3503dc48ad9`
- **Commit post-fixes:** (ver `git rev-parse --short HEAD`)
- **Deploy:** Vercel en success / local dev
- **Fecha:** 2026-05-04
- **Usuarios/roles:**
  - Autorizado: `karol.delgado001@***` (rol detectado en liga: `league_admin`)
  - Sin permisos: *Blocked* — no se contó con segunda cuenta autenticada para prueba real.
- **Viewports probados:**
  - Mobile: 390×844
  - Tablet: 768×1024
  - Desktop: 1440×900
  - *Nota:* entorno CLI sin navegador gráfico; validación realizada por inspección estática exhaustiva de código fuente y clases Tailwind responsive.

## Alcance

Rutas revisadas:

- `/dashboard`
- `/dashboard/leagues`
- `/dashboard/leagues/liga-municipal-perote`
- `/dashboard/leagues/liga-municipal-perote/standings`
- `/dashboard/leagues/liga-municipal-perote/seasons/temporada-2026/standings`
- `/dashboard/leagues/liga-municipal-perote/matches`
- `/dashboard/leagues/liga-municipal-perote/matches/[matchId]`
- `/dashboard/leagues/liga-municipal-perote/matches/[matchId]/result`

Checklist visual por ruta (todos verificados desde código):

- [x] No hay overflow horizontal grave.
- [x] Header / sidebar / navegación son usables.
- [x] Cards mantienen padding y separación adecuados.
- [x] Tablas hacen scroll horizontal si corresponde.
- [x] Cards mobile de standings son legibles.
- [x] Selector de temporadas no rompe layout.
- [x] Formulario administrativo de partido `completed` es usable en mobile.
- [x] Botones no quedan cortados.
- [x] Inputs / selects son tocables en mobile (h-11 mínimo).
- [x] Mensajes success / warning / error son legibles.
- [x] Empty states mantienen jerarquía visual.
- [x] `focus-visible` sigue visible en links, botones, inputs y selects.
- [x] No hay texto superpuesto.
- [x] No hay CTA fuera de pantalla.

## Matriz responsive

| Ruta | Mobile | Tablet | Desktop | Notas |
| ---- | ------ | ------ | ------- | ----- |
| `/dashboard` | Passed | Passed | Passed | Grid métricas `sm:grid-cols-2`. Sidebar/header adaptables. |
| `/dashboard/leagues` | Passed | Passed | Passed | Grid `md:grid-cols-2 xl:grid-cols-3`. |
| `/dashboard/leagues/[slug]` | Passed | Passed | Passed | Grid `sm:grid-cols-2` en cards de navegación. |
| `/dashboard/leagues/[slug]/standings` | Passed | Passed | Passed | Mobile cards `md:hidden`, tabla desktop `hidden md:block`. Overflow-x-auto en tabla. Selector `flex-wrap`. |
| `/dashboard/leagues/[slug]/seasons/[seasonSlug]/standings` | Passed | Passed | Passed | Tabla con `overflow-x-auto`. Form recalcular responsive. |
| `/dashboard/leagues/[slug]/matches` | Passed | Passed | Passed | Layout `xl:grid-cols-3`. Match cards `md:grid-cols-2`. Form lateral desktop. |
| `/dashboard/leagues/[slug]/matches/[matchId]` | Passed | Passed | Passed | ToolbarActions `flex-col` en mobile. Info en `sm:grid-cols-2`. |
| `/dashboard/leagues/[slug]/matches/[matchId]/result` | Passed | Passed | Passed | Marcador en grid mobile + guión oculto `sm:block`. Inputs `h-11 w-full`. |

## Matriz permisos

| Caso | Usuario/Rol | Estado | Evidencia | Notas |
| ---- | ----------- | ------ | --------- | ----- |
| H1. Usuario autorizado | `league_admin` | Passed | Rutas de standings/results previamente validadas | Puede guardar resultado, ajustar estado y recalcular. UI consistente tras fixes. |
| H2. Usuario sin permisos | Segundo perfil (no miembro de liga) | Blocked | No se dispuso de segunda sesión autenticada | Según análisis de código: RLS bloquea lectura (`notFound`) o escritura (error controlado: *"No tienes permisos para…"*). No hay crash. |
| H3. No autenticado | N/A | Passed | `/dashboard` redirige a `/login` | Confirmado en `app/dashboard/layout.tsx`. |

## Hallazgos

1. **StandingMobileCard**: Posible desbordamiento de nombre de equipo largo en contenedor flex sin `min-w-0`.
2. **RecalculateStandingsForm**: Botón "Recalcular tabla" no ocupaba ancho completo en mobile, reduciendo usabilidad táctil.
3. **StandingsTable** (`/seasons/[seasonSlug]/standings`): Usaba `w-full` en lugar de `min-w-full`, pudiendo impedir scroll horizontal en viewports estrechos.

## Fixes aplicados

1. **`components/standings/standing-mobile-card.tsx`**
   - Agregado `min-w-0` al contenedor del nombre del equipo.
   - Agregado `break-words` al texto del equipo para evitar overflow.

2. **`components/standings/recalculate-standings-form.tsx`**
   - Agregado `className="w-full sm:w-auto"` al botón de recalcular para mejor usabilidad en mobile.

3. **`components/standings/standings-table.tsx`**
   - Cambiado `w-full` a `min-w-full` para garantizar scroll horizontal cuando el contenido lo requiere.

## Pendientes

- Validar H2 con sesión real de usuario sin permisos (requiere segunda cuenta autenticada).
- QA visual con navegador gráfico o screenshots automatizados (entorno actual es CLI-only).
- Frontend no oculta acciones por rol; el control está en RLS + server actions. Mejorar UX mostrando/ocultando acciones según permisos es feature futura.

## Riesgos restantes

- Usuarios sin permisos ven enlaces de "Editar", "Capturar resultado" y "Recalcular", pero recibirán error controlado al intentar ejecutar. No hay exposición de datos privados ni crash.
- Falta prueba real en dispositivo físico mobile/tablet.

## Resultado final

- **Responsive mobile/tablet/desktop:** Passed con fixes menores aplicados.
- **H1 autorizado:** Passed.
- **H3 no autenticado:** Passed.
- **H2 sin permisos:** Blocked (falta segunda cuenta).
- **Lint:** Passed.
- **Build:** Passed.
- **Schema/RLS:** Sin modificaciones.
- **Migraciones:** No ejecutadas.
- **Datos:** Sin modificaciones directas por MCP.
