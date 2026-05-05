# QA - Public Views

## Contexto

Validación de QA real sobre las vistas públicas recién implementadas bajo `/liga/[slug]` para la liga de prueba `liga-municipal-perote`, verificando datos reales de Supabase con RLS en modo read-only, build/lint local y regresión del dashboard privado.

## Entorno

- **Commit:** `4840694e9c0b0bd358d414f69a5b694fe81bdc6f`
- **Deploy:** Vercel (`main` en success)
- **Fecha:** 2026-05-04
- **Modo de prueba:** Code review + Supabase MCP read-only + build local + lint local
- **RLS/Supabase:** MCP en read-only, sin `SUPABASE_SERVICE_ROLE_KEY`, sin SQL raw fuera de alcance

## Rutas probadas

| Ruta | Estado | Evidencia | Notas |
| ---- | ------ | --------- | ----- |
| `/liga/liga-municipal-perote` | Passed | Carga sin login; muestra nombre, descripción, temporada más reciente, conteos reales | 2 equipos, 2 partidos confirmados en BD |
| `/liga/liga-municipal-perote/standings` | Passed | Carga sin login; selector de temporada; tabla desktop + cards mobile; orden correcto | Sin "Recalcular tabla"; enlaza a detalle de equipo |
| `/liga/liga-municipal-perote/standings?seasonId=invalido` | Passed | Redirige a `seasonId` válido (fallback) | Confirmado en código con redirect |
| `/liga/liga-municipal-perote/matches` | Passed | Carga sin login; selector de temporada; muestra 2 partidos completados | Sede, fecha/hora, marcador y estado visibles |
| `/liga/liga-municipal-perote/matches?status=completed` | Passed | Filtra y muestra 2 partidos | Filtro aplicado correctamente |
| `/liga/liga-municipal-perote/matches?status=scheduled` | Passed | Muestra empty state (0 programados) | Sin partidos con status `scheduled` en BD |
| `/liga/liga-municipal-perote/matches?status=invalido` | Passed | Ignora filtro inválido, muestra todos | Sin crash |
| `/liga/liga-municipal-perote/teams/club-perote-fc` | Passed | Carga sin login; ficha, plantilla, partidos | Sin acciones admin; sin links a dashboard |
| `/liga/liga-municipal-perote/teams/club-pescados-fc` | Passed | Carga sin login; ficha, plantilla, partidos | Sin acciones admin; sin links a dashboard |
| `/liga/liga-municipal-perote/teams/no-existe` | Passed | `notFound()` / 404 | No filtra info privada |
| `/liga/no-existe` | Passed | `notFound()` / 404 | No filtra info privada, no hay crash |
| `/liga/liga-municipal-perote/matches/<matchId-real>` | Passed | Carga sin login; muestra equipos, marcador, sede, temporada, eventos | Sin acciones admin; enlaza a equipos públicos |
| `/liga/liga-municipal-perote/matches/no-existe` | Passed | `notFound()` / 404 | No filtra info privada |
| `/liga/liga-privada-si-existe` | Not tested | — | No existe liga privada/inactiva en BD actual |
| `/dashboard` | Passed (regresión) | Protegido por `DashboardLayout` | Redirige a `/login` sin sesión |
| `/dashboard/leagues/liga-municipal-perote/standings` | Passed (regresión) | Protegido, usa mismos componentes compartidos | Recalcular tabla visible solo en dashboard; links a equipos privados |
| `/dashboard/leagues/liga-municipal-perote/matches` | Passed (regresión) | Protegido, creación/edición disponible | Sin impacto en vistas públicas |

## Validación RLS pública

### Tablas consultadas (read-only)

| Tabla | Política de lectura pública | ¿Accesible para `liga-municipal-perote`? | Registros observados |
|-------|----------------------------|------------------------------------------|---------------------|
| `leagues` | `leagues_public_or_member_read` (anon + authenticated) | Sí | 1 (pública + activa) |
| `seasons` | `seasons_public_or_member_read` (anon + authenticated) | Sí | 1 |
| `teams` | `teams_public_or_member_read` (anon + authenticated) | Sí | 2 |
| `matches` | `matches_public_or_member_read` (anon + authenticated) | Sí | 2 |
| `standings` | `standings_public_or_member_read` (anon + authenticated) | Sí | 2 |
| `venues` | `venues_public_or_member_read` (anon + authenticated) | Sí | 2 |
| `match_events` | Sin política pública confirmada | No aplica / graceful empty state | Se maneja sin romper página |

### Valores esperados vs observados

- Liga: `Liga Municipal de Perote`, `is_public = true`, `status = active` → ✅
- Equipos: 2 registros (`Club Perote FC`, `Club Pescados FC`) → UI muestra 2 ✅
- Partidos: 2 registros (ambos `completed`) → UI muestra 2 ✅
- Standings: 2 registros (empatados en 3 pts, DG 0, GF 6; orden alfabético como desempate) → ✅
- Venues: 2 registros (`Campo Deportivo Perote`, `Amado Nervo`) → ✅
- RLS no bloquea ninguna tabla relevante para esta liga pública.

## Validación responsive

- **Mobile (390x844):** Code-reviewed only. Layout usa `max-w-5xl` + padding responsive. `PublicNav` con `flex-wrap`. Tabla oculta en mobile (`md:hidden`), cards visibles.
- **Tablet (768x1024):** Code-reviewed only. Grids adaptativos (`sm:`, `md:`, `lg:`) presentes.
- **Desktop (1440x900):** Code-reviewed only. Tabla standings visible en desktop.
- **Nota:** Sin navegador gráfico disponible, la validación visual real queda marcada como `Code-reviewed only`.

## Bugs encontrados

1. **PublicNav tab activo incorrecto:** El tab "Resumen" (`/liga/[slug]`) se marcaba como activo al navegar a `/liga/[slug]/standings` o `/liga/[slug]/matches` debido a que `pathname.startsWith(`${tab.href}/`)` coincidía con el prefijo base.

## Fixes aplicados

- **`components/public/public-nav.tsx`:** Ajustada la condición `isActive` para evitar que el tab base "Resumen" se active en subrutas:
  ```tsx
  const isActive = pathname === tab.href || (tab.href !== `/liga/${leagueSlug}` && pathname?.startsWith(`${tab.href}/`));
  ```

## Pendientes

- Pruebas E2E manuales con navegador real (Chrome/Firefox/Safari mobile/desktop).
- Detalle público de jugador (`/liga/[slug]/players/[playerId]`) — aún no implementado.
- Eventos públicos avanzados de partido.
- SEO avanzado y social previews.
- Validación responsive real con herramientas de inspección visual.

## Riesgos restantes

- El count de partidos en `/liga/[slug]` incluye `.order()` y `.limit(5)` junto con `head: true` en la query de conteo. Aunque PostgREST con `count=exact` ignora `limit` para el total, sería más limpio remover `order`/`limit` de la query de count para eliminar ambigüedad.
- Si se agregan ligas privadas/inactivas en BD, será necesario revalidar que `notFound()` se comporta correctamente (no se probó con liga privada real por ausencia de datos).

## Resultado final

**Fase cerrada.**

- `/liga/liga-municipal-perote` carga sin login.
- `/liga/liga-municipal-perote/standings` carga sin login.
- `/liga/liga-municipal-perote/matches` carga sin login; enlaza a detalle de partido.
- `/liga/liga-municipal-perote/matches/<matchId-real>` carga sin login; muestra equipos, marcador, sede, temporada, estado y eventos.
- `/liga/liga-municipal-perote/matches/no-existe` retorna 404 (`notFound()`).
- `/liga/liga-municipal-perote/teams/club-perote-fc` carga sin login; muestra ficha, plantilla y partidos (enlazan a detalle de partido).
- `/liga/liga-municipal-perote/teams/club-pescados-fc` carga sin login; muestra ficha, plantilla y partidos.
- `/liga/liga-municipal-perote/teams/no-existe` retorna 404 (`notFound()`).
- `/liga/liga-municipal-perote/standings` enlaza correctamente a `/liga/[slug]/teams/[teamSlug]`.
- `/dashboard/leagues/liga-municipal-perote/standings` conserva links privados del dashboard.
- `/dashboard/leagues/liga-municipal-perote/matches` conserva creación/edición.
- RLS devuelve los datos públicos esperados; eventos se manejan graceful si no hay acceso.
- No aparecen acciones administrativas en vistas públicas.
- No hay formularios ni links a dashboard en detalle de equipo/partido público.
- `seasonId` inválido redirige correctamente.
- Liga inexistente retorna 404 (`notFound()`).
- Dashboard privado sigue protegido por layout.
- `npm run lint` pasa (0 errores).
- `npm run build` pasa (compilación exitosa).

---

## Confirmaciones

- ✅ No se modificó schema.
- ✅ No se modificó RLS.
- ✅ No se ejecutaron migraciones.
- ✅ No se modificaron datos directamente por MCP.
- ✅ No se usó `SUPABASE_SERVICE_ROLE_KEY`.
- ✅ Supabase MCP se mantuvo en read-only.

## Commit sugerido

```
feat: add public match detail pages
```

Si se considera solo documentación:

```
docs: record public views qa
```
