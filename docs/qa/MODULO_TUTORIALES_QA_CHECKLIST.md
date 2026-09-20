# QA Checklist — Módulo Tutoriales

> Ejecutar antes de marcar implementado en `IMPLEMENTATION_STATUS.md`. Requiere evidencia, no afirmaciones.

## 1. Automatizado (debe estar verde)

- [ ] `npm run lint` pasa
- [ ] `npm test` pasa (incluye `lib/tutorials/*.test.ts` si existe)
- [ ] `npm run build` pasa sin errores TS

## 2. Permisos por rol (manual con `seed_test_users_by_role.sql`)

| Rol | Ve `/dashboard/ayuda` | Solo ve sus tutoriales + viewer | Detalle directo a slug ajeno → 404/oculto |
|---|---|---|---|
| `super_admin` | [ ] | ve todo [ ] | N/A |
| `league_admin` | [ ] | [ ] | [ ] |
| `team_admin` | [ ] | [ ] | [ ] |
| `coach` | [ ] | [ ] | [ ] |
| `referee` | [ ] | [ ] | [ ] |
| `viewer` | [ ] | [ ] | [ ] |
| Sin sesión | redirect `/login` [ ] | — | — |

## 3. Funcional

- [ ] Lista carga <2s con 50 tutoriales, paginado/limit OK
- [ ] Búsqueda `?q=` filtra por título; `q` >100 car. o con `<script>` no crashea ni ejecuta XSS
- [ ] `?rol=invalido` y `?tag=<script>` se ignoran sin crash (allowlist)
- [ ] `is_published=false` no aparece en lista ni detalle (`notFound()`)
- [ ] Pasos ordenados por `step_order`, Markdown sin HTML crudo
- [ ] FAQ acordeón abre/cierra con teclado (`focus-visible`)
- [ ] Media: gif/webp con `alt`, mp4 con `controls` + `preload="metadata"`; archivo >8MB rechazado en subida
- [ ] `related_route` apunta a ruta existente (verificar contra `app/**/page.tsx`)
- [ ] Móvil 360px: cards, pasos y video sin overflow horizontal

## 4. Seguridad

- [ ] Sin `SUPABASE_SERVICE_ROLE_KEY` en `app/`, `components/`, `lib/tutorials/`
- [ ] RLS: anon no lee `tutorials`; authenticated solo `is_published=true` (probar con cliente anon)
- [ ] Sin `dangerouslySetInnerHTML` sin sanitizar (grep)
- [ ] Auditoría no rota (best-effort intacto en acciones tocadas)
