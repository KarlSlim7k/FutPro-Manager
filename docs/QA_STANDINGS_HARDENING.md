# QA Standings Hardening (Pre-MVP)

## Checklist funcional

- [ ] Recálculo manual exitoso genera audit log `standings.recalculated_manual`.
- [ ] Guardar resultado en estado `completed` genera recálculo automático.
- [ ] Cambiar partido de `completed` a otro estado recalcula standings.
- [ ] Fallo de recálculo automático conserva resultado y muestra `standingsWarning`.
- [ ] Fallo de recálculo automático genera audit log `standings.recalculate_failed` (best-effort).
- [ ] Recalculo automático exitoso genera audit log `standings.recalculated_auto` (best-effort).
- [ ] Audit filters permiten `standings.recalculated_manual`, `standings.recalculated_auto`, `standings.recalculate_failed` y entity type `season`.
- [ ] Valores inválidos de filtros de auditoría siguen ignorándose sin crash.
- [ ] Si hay inconsistencias de equipos, el recálculo no falla y reporta `skippedMatchesCount > 0`.
- [ ] Se revalidan rutas de dashboard y públicas de standings/liga.

## Guardrails verificados

- [ ] No se tocaron migraciones (`supabase/migrations/*`).
- [ ] No se modificó schema ni RLS.
- [ ] No se usó `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] No se agregaron tablas nuevas.

## Validación técnica

- [ ] `npm run lint`
- [ ] `npm run build`

## Pendientes post-MVP

- Jobs/background reales para recálculo.
- Event bus/queue.
- Triggers SQL de auditoría automática.
- Historial avanzado de standings.
- Reglas avanzadas de desempate.

## Referencia cruzada

- Ver consolidado RC pre-MVP: `docs/QA_RELEASE_CANDIDATE.md`.
