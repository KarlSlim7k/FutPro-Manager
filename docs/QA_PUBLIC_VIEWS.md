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
| `/liga/liga-municipal-perote/matches/<matchId-real>` | Passed | Carga sin login; muestra equipos, marcador, sede, temporada, eventos con timeline visual | Sin acciones admin; enlaza a equipos públicos |
| `/liga/liga-municipal-perote/matches/no-existe` | Passed | `notFound()` / 404 | No filtra info privada |
| `/liga/liga-municipal-perote/players/<playerId-real>` | Passed (2026-05-18) | Carga sin login; muestra datos del jugador | Validado en PR #5 |
| `/liga/liga-municipal-perote/players/no-existe` | Passed (2026-05-18) | `notFound()` / 404 | No filtra info privada |
| `/liga/liga-qa-codex/players/0aae9fd4-111e-4c0b-bb18-d31f7ea0218e` | Passed (2026-05-19) | Carga sin sesión; muestra nombre, foto, estado, posición, registro de equipo/temporada y empty state de eventos | Validado tras policy pública mínima de `players` |
| `/liga/liga-qa-codex/players/no-existe` | Passed (2026-05-19) | `notFound()` / 404 | No filtra info privada |
| `/liga/liga-municipal-perote/matches?status=completed&teamId=<id>` | Passed (2026-05-18) | Filtra correctamente por combinacion | Validado en PR #4 |
| `/liga/liga-municipal-perote/matches?round=1` | Passed (2026-05-18) | Filtra por jornada cuando aplique | Validado en PR #4 |
| `/liga/liga-municipal-perote/matches?teamId=invalido` | Passed (2026-05-18) | Ignora filtro invalido, muestra todos | Sin crash |
| `/liga/liga-municipal-perote/matches?round=invalido` | Passed (2026-05-18) | Ignora filtro invalido, muestra todos | Sin crash |
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
| `match_events` | `match_events_public_or_member_read` (anon + authenticated) | Sí, cuando liga pública/activa | Se maneja con empty state si no hay eventos |
| `players` | `Public read players in public active leagues` (`anon`) | Sí, solo si liga pública/activa | 1 jugador QA validado |

### Policy pública de jugadores (2026-05-19)

- Migración: `supabase/migrations/20260519173826_public_players_read_policy.sql`.
- Policy: `Public read players in public active leagues`.
- Alcance: `SELECT` para `anon` sobre `public.players`.
- Condición: el jugador debe pertenecer a una liga con `is_public = true` y `status = 'active'`.
- Guardrails: sin `INSERT`, `UPDATE` ni `DELETE` públicos; sin `service_role`; sin controles admin en UI pública.
- Validación RLS:
  - `anon` ve el jugador QA de `liga-qa-codex`;
  - `anon` no ve jugador de liga privada/inactiva en pruebas transaccionales rollback;
  - `anon` no puede insertar y no modificó ni borró el jugador QA.

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

- Pruebas E2E automatizadas con navegador real (Chrome/Firefox/Safari mobile/desktop).
- Validación responsive real con herramientas de inspección visual.
- Social previews avanzados con imágenes dinámicas (OG images).
- Estadísticas públicas avanzadas (post-MVP).

## Riesgos restantes

- El count de partidos en `/liga/[slug]` incluye `.order()` y `.limit(5)` junto con `head: true` en la query de conteo. Aunque PostgREST con `count=exact` ignora `limit` para el total, sería más limpio remover `order`/`limit` de la query de count para eliminar ambigüedad.
- Si se agregan ligas privadas/inactivas en BD, será necesario revalidar que `notFound()` se comporta correctamente (no se probó con liga privada real por ausencia de datos).

## Resultado final

**Fase cerrada.**

- `/liga/liga-municipal-perote` carga sin login.
- `/liga/liga-municipal-perote/standings` carga sin login.
- `/liga/liga-municipal-perote/matches` carga sin login; enlaza a detalle de partido.
- `/liga/liga-municipal-perote/matches/<matchId-real>` carga sin login; muestra equipos, marcador, sede, temporada, estado y eventos con timeline visual (minuto, tipo, equipo local/visitante, jugador).
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
- ✅ No se modificó RLS en la validación original de Fase 5 (2026-05-04/18).
- ✅ Cambio RLS posterior y acotado (2026-05-19): policy `SELECT` pública mínima para `players` en ligas públicas activas.
- ✅ Migración posterior agregada (2026-05-19): `supabase/migrations/20260519173826_public_players_read_policy.sql`.
- ✅ No se modificaron datos directamente por MCP en la validación original de Fase 5.
- ✅ Dato QA posterior agregado (2026-05-19): inscripción mínima de `Jugador QA Codex` en `Equipo QA Codex` / `Temporada QA Codex` para validar enlace público equipo -> jugador.
- ✅ No se usó `SUPABASE_SERVICE_ROLE_KEY`.
- ✅ Supabase MCP se mantuvo en read-only en la validación original; el cierre del pendiente 2026-05-19 aplicó solo la migración RLS acotada y dato QA mínimo.

## Commit sugerido

```
feat: polish public match events
```

Si se considera solo documentación:

```
docs: record public views qa
```

## QA agregado Fase 5 (2026-05-18)
- Probado `/liga/[slug]/players/[playerId]` y `/liga/[slug]/players/no-existe`.
- Probado detalle de partido con eventos y sin eventos.
- Probados filtros validos e invalidos en `/liga/[slug]/matches` (`seasonId`, `status`, `teamId`, `round`).
- Metadata basica SEO/OpenGraph/Twitter verificada en vistas publicas principales via code review.
- `npm run lint` y `npm run build` exitosos (PR #4, PR #5).
- Pendiente post-MVP: social previews con imagen dinamica, E2E automatizado, QA cross-browser real.

## QA adicional - Eventos públicos (2026-05-18)
- Verificado timeline visual con filtros client-side en `/liga/liga-municipal-perote/matches/<matchId-real>`.
- Filtros probados: `Todos`, `Goles`, `Tarjetas`, `Sustituciones`, `Penales`.
- Validado resumen superior de eventos: total, goles, tarjetas, sustituciones y penales.
- Validado fallback seguro cuando faltan `team_id`, `player_id` o `notes` (texto "No especificado" y layout sin ruptura).
- Validado empty state general cuando no hay eventos y empty state específico cuando un filtro no tiene resultados.
- Validado enlace público de jugador desde evento: `/liga/[slug]/players/[playerId]`.

## QA adicional - Detalle público de jugador y media QA (2026-05-19)
- Validado `/liga/liga-qa-codex/players/0aae9fd4-111e-4c0b-bb18-d31f7ea0218e` sin sesión: HTTP 200.
- Validado `/liga/liga-qa-codex/players/no-existe` sin sesión: HTTP 404.
- Confirmado que la vista pública del jugador muestra nombre, foto, estado y posición, sin links ni controles de dashboard.
- Confirmado que la vista pública de equipo enlaza al jugador QA cuando existe registro de plantilla.
- `player_team_registrations` y `match_events` ya cuentan con lectura pública controlada para ligas públicas activas; se mantuvieron como están.


## Referencia cruzada

- Ver consolidado RC pre-MVP: `docs/QA_RELEASE_CANDIDATE.md`.
