# QA - Auditoria (Fase 6C)

## Alcance

Validacion de la vista de auditoria por liga y la instrumentacion de acciones administrativas en FutPro Manager.

## Rutas validadas

- `/dashboard/leagues/[slug]/audit`

## Checklist de validacion

| Caso | Resultado esperado | Estado |
| --- | --- | --- |
| `league_admin` accede a `/audit` | Ve tabla/cards de logs filtrados por liga | Por validar |
| `super_admin` accede a `/audit` | Ve tabla/cards de logs | Por validar |
| `viewer`/`coach`/`referee` accede a `/audit` | Ve card de acceso restringido | Por validar |
| Usuario no autenticado en `/audit` | Redirige a `/login` | Por validar |
| Cambio de rol genera audit log | Fila en `audit_logs` con `action=member.role_updated` | Por validar |
| Asignacion de arbitro genera audit log | Fila en `audit_logs` con `action=match.referee_updated` | Por validar |
| Remocion de arbitro genera audit log | Fila en `audit_logs` con `action=match.referee_removed` | Por validar |
| Fallo de audit log no rompe accion principal | Accion devuelve `success: true` aunque audit falle | Por validar |
| Filtro `action` invalido o vacio | No crashea; se ignora | Por validar |
| Filtros `from`/`to` con fechas invalidas | No crashea; se ignoran | Por validar |
| Filtro `actorId` con UUID invalido | No crashea; se ignora | Por validar |
| Sin logs que coincidan con filtros | EmptyState visible | Por validar |
| Actor sin perfil legible por RLS | Fallback `Usuario <id corta>` visible | Por validar |
| Card "Auditoria" en dashboard de liga | Visible solo para `league_admin`/`super_admin` | Por validar |
| No hay cambios en `supabase/migrations/` | Sin archivos modificados en esa carpeta | Confirmado |

## Guardrails confirmados

- No se modificaron archivos en `supabase/migrations/`.
- No se modifico schema.
- No se modifico RLS.
- No se usa `SUPABASE_SERVICE_ROLE_KEY`.
- `createAuditLog` es best-effort: fallo no rompe la accion principal.
- RLS sigue siendo autoridad final de seguridad.
- No se insertan datos sensibles en metadata (solo roles, slugs, IDs de entidades de dominio).

## Build y lint

- `npm run lint`: pendiente de validacion con build completo.
- `npm run build`: pendiente de validacion.

## Pendientes post-MVP

- QA funcional con cuentas reales de distintos roles.
- Instrumentacion exhaustiva de todos los server actions.
- Auditoria automatica via triggers SQL o event bus.
- Exportacion CSV/PDF de logs.
- Retencion avanzada y politicas de limpieza.
- Auditoria global para `super_admin` (multi-liga).
- Filtros full-text y busqueda avanzada.

## Fecha

2026-05-18
