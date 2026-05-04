# QA - Standings and Match Results

## Contexto

QA funcional guiado y revisión técnica del flujo de resultados/standings después del cambio:

- Commit objetivo: `594cdbe673d628641f905f77cfe2174b71f699ac`
- Cambio reportado: auto-recálculo de standings al guardar resultados que impactan partidos `completed`.
- Restricciones respetadas: sin cambios de schema/RLS/migraciones ni escrituras directas por MCP.

## Alcance

- Revisión estática de lógica y wiring entre server actions, formularios y páginas de standings.
- Validación read-only de consistencia de datos en Supabase.
- Validaciones técnicas del proyecto (`npm run lint`, `npm run build`).
- Validación ejecutada de redirección para usuario no autenticado.

## Entorno revisado

- Branch: `main`
- Commit: `594cdbe` (HEAD actual)
- Deploy/Vercel: desplegado según contexto del usuario (no verificado desde CLI)
- Fecha: 2026-05-03

## Matriz de pruebas

| Caso | Estado | Evidencia | Notas |
| ---- | ------ | --------- | ----- |
| A. scheduled -> completed actualiza standings | Code-reviewed only | `app/dashboard/leagues/[slug]/matches/[matchId]/result/actions.ts`, `lib/standings/recalculate-standings.ts` | La acción guarda marcador con `status: "completed"` y llama `recalculateStandingsForSeason`. |
| B. completed cambia marcador y recalcula | Code-reviewed only | `app/dashboard/leagues/[slug]/matches/[matchId]/result/actions.ts`, `lib/standings/recalculate-standings.ts` | Recalcula desde todos los partidos `completed`, evitando acumulaciones incrementales incorrectas. |
| C. completed -> otro status retira impacto | Failed | `app/dashboard/leagues/[slug]/matches/[matchId]/edit/actions.ts`, `components/matches/edit-match-form.tsx`, `components/matches/match-result-form.tsx`, `components/matches/update-match-result-form.tsx` | El flujo visible no permite transición desde `completed` a otro estado. Existe acción con soporte (`app/.../matches/[matchId]/actions.ts`) pero el form asociado no está conectado en rutas activas. |
| D. recálculo manual | Code-reviewed only | `app/dashboard/leagues/[slug]/seasons/[seasonSlug]/standings/actions.ts`, `components/standings/recalculate-standings-form.tsx` | Botón/manual action funcional por código, con mensajes de éxito/error. |
| E. `seasonId` inválido en standings | Code-reviewed only | `app/dashboard/leagues/[slug]/standings/page.tsx` | Hay redirección explícita a temporada fallback válida cuando `seasonId` no existe para la liga. |
| F. empty states | Code-reviewed only | `app/dashboard/leagues/[slug]/standings/page.tsx`, `app/dashboard/leagues/[slug]/seasons/[seasonSlug]/standings/page.tsx` | Revisados estados para liga sin temporadas y temporada sin standings. Se corrigió copy desactualizado. |
| G. responsive (desktop/mobile) | Code-reviewed only | `app/dashboard/leagues/[slug]/standings/page.tsx`, `components/standings/standings-table-view.tsx`, `components/standings/standing-mobile-card.tsx` | Render dual y misma información base (tabla desktop + cards mobile). |
| H. permisos/RLS | Blocked | `curl -I http://127.0.0.1:3100/dashboard` -> `307 location: /login`; revisión de acciones con `auth.getUser()` | Validado subcaso no autenticado. Bloqueado admin/sin permisos por falta de sesión de prueba con roles diferenciados. |

## Resultados

- **Lógica de cálculo compartida:** centralizada en `lib/standings/recalculate-standings.ts`, sin duplicación de algoritmo en acciones.
- **Service role:** no encontrado en el flujo revisado; se usa `createClient()` con publishable key (`lib/supabase/server.ts`).
- **RLS/Auth path:** las acciones relevantes verifican usuario y usan cliente Supabase con contexto de sesión.
- **Errores de recálculo:** no bloquean guardado de resultado; se retorna `standingsWarning` en UI cuando falla recálculo automático.
- **Consistencia de datos (read-only MCP):**
  - `standings`: 2 filas en la temporada `5cf746db-7385-43e5-9730-ef6397b09811`.
  - `matches completed`: 2 partidos en la misma temporada.
  - Sin duplicados `season_id + team_id`.
  - Re-cálculo SQL esperado vs filas guardadas: valores coinciden en PJ/G/E/P/GF/GC/DG/PTS para ambos equipos.

## Bugs encontrados

1. **[Mayor] Falta de flujo UI activo para `completed -> non-completed`**  
   El caso C no es cubrible en la UI actualmente: el formulario de edición no permite editar partidos `completed` y el formulario que sí maneja `status` no está conectado a una ruta activa.
2. **[Menor - corregido] Mensaje desactualizado en empty state de standings**  
   Decía que la generación automática sería “fase posterior”, cuando ya existe auto-recálculo.

## Pendientes de validación manual

- Ejecución real E2E de casos A/B/C/D con usuario `league_admin` en entorno desplegado.
- Caso H con usuario sin permisos explícitos para confirmar mensaje controlado por RLS.
- Caso G en dispositivos reales (mobile/desktop) y navegadores objetivo.

## Riesgos

- La cobertura funcional del caso C queda incompleta en UI, lo que impide retirar impacto de un partido `completed` mediante flujo operativo estándar.
- Sin sesiones de prueba por rol, la validación de permisos queda parcial.

## Recomendaciones siguientes

1. Crear commit específico para resolver el bug mayor del caso C (con decisión explícita de UX/permisos sobre dónde exponer el cambio de estado desde `completed`).
2. Ejecutar ronda QA manual autenticada con al menos: `league_admin`, usuario sin permisos y usuario no autenticado.
3. Mantener verificación de consistencia season/team en `standings` como checklist de regresión post-release.
