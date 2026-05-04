# QA - Standings and Match Results

## Contexto

Ejecución de QA funcional autenticado para validar la regresión:

`completed -> non-completed -> completed`

- Commit objetivo informado: `3a7eb85740b2b19b5a494a64bc81576361856d4e`
- Restricciones respetadas: sin cambios de schema/RLS, sin migraciones, sin SQL raw, sin escrituras vía MCP.

## Entorno y datos usados

- Entorno: local dev conectado a Supabase real (`http://127.0.0.1:3200`)
- Fecha: 2026-05-03 / 2026-05-04
- Usuario probado: `karol.delgado001@***` (rol detectado en liga: `league_admin`)
- Liga: `liga-municipal-perote`
- Temporada: `temporada-2026` (`5cf746db-7385-43e5-9730-ef6397b09811`)
- Partido usado para regresión:
  - `/dashboard/leagues/liga-municipal-perote/matches/87089467-edc4-4344-9842-e28f8a713189`
  - `/dashboard/leagues/liga-municipal-perote/matches/87089467-edc4-4344-9842-e28f8a713189/result`

## Matriz de pruebas

| Caso | Estado | Evidencia ejecutada | Observación |
| ---- | ------ | ------------------- | ----------- |
| A. Partido no `completed` pasa a `completed` | Passed | Ruta: `/dashboard/leagues/liga-municipal-perote/matches/87089467-edc4-4344-9842-e28f8a713189/result` | Antes: `scheduled` 6-4. Después: `completed` 6-5. Standings sube de PJ=1 a PJ=2 para ambos equipos y coincide con cálculo esperado. |
| B. Partido `completed` cambia marcador | Passed | Ruta: `/dashboard/leagues/liga-municipal-perote/matches/87089467-edc4-4344-9842-e28f8a713189` (form administrativo) | Antes: 5-4. Después: 6-4. Standings se actualiza (GF/GC/DG), sin duplicar PJ ni acumular puntos previos. |
| C. `completed -> non-completed` retira impacto | Passed | Ruta: `/dashboard/leagues/liga-municipal-perote/matches/87089467-edc4-4344-9842-e28f8a713189` (status `scheduled`) | Al pasar a `scheduled`, la tabla deja de contar ese partido: PJ baja de 2 a 1 y puntos/goles bajan correctamente. |
| D. `non-completed -> completed` vuelve a contar | Passed | Mismo partido del caso C en `/result` | Vuelve a `completed` y standings regresa a incluir el partido sin duplicación de PJ/puntos. |
| E. Recálculo manual por temporada | Passed | Ruta: `/dashboard/leagues/liga-municipal-perote/seasons/temporada-2026/standings` | Recalcular funciona como respaldo. `updated_at` de standings avanza y datos permanecen consistentes. |
| F. `seasonId` inválido | Passed | Ruta: `/dashboard/leagues/liga-municipal-perote/standings?seasonId=invalido` | Redirección 307 a `?seasonId=5cf746db-7385-43e5-9730-ef6397b09811` (válido). |
| G. Responsive (desktop/mobile) | Blocked | Requiere validación visual real de viewport | Entorno CLI sin navegador visual para comprobar legibilidad/overflow real en mobile/desktop. |
| H1. Usuario autorizado | Passed | Mismas rutas de A/B/C/D/E | Usuario con rol operativo pudo guardar resultado, ajustar administrativo y recalcular. |
| H2. Usuario sin permisos | Blocked | No se contó con segunda cuenta sin permisos | Falta sesión multi-rol para validar error controlado de no autorizado. |
| H3. No autenticado | Passed | Ruta: `/dashboard` | Redirección 307 a `/login`. |

## Evidencia resumida antes/después (standings)

Equipos:
- `Club Perote FC`
- `Club Pescados FC`

Caso B (corrección de marcador `completed`):
- Antes: ambos con PJ 2, PTS 3, GF/GC 6/6.
- Después (6-4):  
  - Perote: PJ 2, GF/GC 7/6, DG +1, PTS 3  
  - Pescados: PJ 2, GF/GC 6/7, DG -1, PTS 3

Caso C (`completed -> scheduled`):
- Antes: ambos PJ 2.
- Después: standings queda con solo 1 partido `completed`:
  - Pescados: PJ 1, G 1, PTS 3
  - Perote: PJ 1, P 1, PTS 0

Caso A/D (`scheduled -> completed` en `/result`):
- Antes: partido en `scheduled`, standings PJ 1 por equipo.
- Después: partido en `completed` 6-5, standings vuelve a PJ 2 por equipo.

## Verificación read-only de consistencia (sin SQL raw)

### Consultas MCP read-only

- `supabase-list_tables` (schema `public`):
  - `matches`: 2 filas, RLS habilitado.
  - `standings`: 2 filas, RLS habilitado.
- `supabase-list_migrations`:
  - `0001_initial_schema`

### Consistencia de datos observada

- Duplicados por `season_id + team_id` en `standings`: **0**
- Comparación standings guardado vs cálculo esperado desde partidos `completed`:
  - Estado inicial: **coincide**
  - Estado final: **coincide**

## Validaciones técnicas

- `npm run lint`: Passed
- `npm run build`: Passed
- Pruebas automatizadas configuradas en scripts del proyecto: no detectadas.

## Bugs encontrados

- No se detectaron bugs funcionales nuevos en los casos ejecutados A/B/C/D/E/F/H1/H3.

## Riesgos restantes

1. Falta validación visual responsive real (Caso G).
2. Falta validación con cuenta sin permisos (Caso H2).

## Resultado final de QA manual

El flujo de resultados y standings queda validado manualmente para el MVP con usuario autorizado.
