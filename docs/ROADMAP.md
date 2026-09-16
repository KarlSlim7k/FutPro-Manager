# Roadmap

## Roadmap de producto

### Fase 0 - Base técnica (Completado)
- Setup de stack (Next.js + TypeScript + Tailwind + Supabase).
- Auth inicial con Supabase.
- Schema base y RLS inicial en migración.
- Base multi-liga con `league_id` y slugs.

### Fase 1 - Dashboard y administración base de ligas (Mayormente completado)
- Dashboard autenticado y navegación principal.
- Listado y detalle de ligas.
- Gestión base operativa de entidades por liga.

### Fase 2 - Temporadas / equipos / jugadores (Implementación funcional, con mejoras pendientes)
- Temporadas: listado/alta/detalle.
- Equipos: alta/edición/detalle.
- Jugadores y registros en plantillas: flujos base activos.
- Pendiente: validaciones avanzadas y reportes.

### Fase 3 - Partidos / resultados / eventos (Implementación funcional, con mejoras pendientes)
- Partidos: creación, edición y detalle.
- Resultados: captura/actualización.
- Eventos: registro operativo por partido.
- Pendiente: flujos avanzados de asignación arbitral y trazabilidad.

### Fase 4 - Tabla de posiciones (Implementado con hardening MVP)
- Vista de standings implementada y conectada a datos reales.
- Existe recálculo manual por temporada en dashboard.
- Existe recálculo automático al guardar resultados que impactan estado `completed`.
- Incluye recálculo manual por temporada, recálculo automático al actualizar resultados `completed`, auditoría best-effort de recálculos, warnings por inconsistencias de equipos (`skipped matches`) y revalidación de rutas dashboard/públicas.
- **Post-MVP:** jobs/background reales, event bus/queue, triggers SQL, historial avanzado y desempates complejos.

### Fase 5 - Vista pública (Completado para MVP)
- ✅ Portal público: resumen de liga, standings, calendario/lista de partidos, detalle de partido, detalle de equipo y detalle de jugador.
- ✅ Eventos públicos: timeline visual, resumen por categorias y filtros (todos/goles/tarjetas/sustituciones/penales).
- ✅ Filtros publicos de partidos: estado, equipo y jornada/round cuando aplique.
- ✅ SEO basico: metadata, OpenGraph y Twitter en vistas publicas principales.
- ✅ Navegacion de consulta para aficionados entre vistas publicas.
- ✅ QA publico validado con datos reales de Supabase/RLS; build y lint exitosos (PR #4 y PR #5).
- **Post-MVP:** OG dinamico con imagenes, E2E automatizado, QA visual cross-browser/manual, estadisticas publicas avanzadas.

### Fase 6 - Roles avanzados, árbitros, auditoría (Base técnica + hardening UX + UI de administracion de miembros implementada)
- Modelo base en schema/RLS.
- Hardening UX de permisos en dashboard implementado: helper `getLeaguePermissions` y ocultamiento de CTAs administrativas según rol.
- **Fase 6A - Administracion de miembros por liga (Implementado):**
  - UI de administracion de miembros por liga: ruta `/dashboard/leagues/[slug]/members`.
  - Cambio de roles de miembros de liga desde dashboard (league_admin, team_admin, coach, referee, viewer).
  - Helper de permisos extendido con `canManageMembers`/`canManageRoles`.
  - Guardrails: no se permite asignar `super_admin` desde UI, proteccion del ultimo `league_admin`.
  - Vista informativa sin controles de edicion para usuarios sin permisos de administracion.
- **Fase 6B - Asignacion basica de arbitros a partidos (Implementado):**
  - Asignacion y remocion de arbitro desde el detalle de partido.
  - Helper de permisos extendido con `canAssignReferees`/`canViewRefereeAssignments`.
  - Solo `super_admin` y `league_admin` pueden asignar arbitros.
  - Solo miembros con rol `referee` o `league_admin` pueden ser asignados como arbitro.
  - Tarjeta de arbitro visible en detalle de partido; nombre de arbitro visible en listado de partidos.
  - Sin cambios a schema, RLS ni migraciones.
- **Fase 6C - Auditoria visible en UI (Implementado + hardening menor):** Vista de auditoria por liga en `/dashboard/leagues/[slug]/audit`. Solo accesible para `super_admin` y `league_admin`. Filtros por accion, tipo de entidad, actor y rango de fechas via query params; `action` y `entityType` con validacion server-side por allowlist (valores invalidos se ignoran sin crash). Instrumentacion best-effort en `updateMemberRoleAction` (`member.role_updated`) y `updateMatchRefereeAction` (`match.referee_updated` / `match.referee_removed`). Sin cambios a schema, RLS ni migraciones. Sin service role.
- **Fase 6D - Auditoría exhaustiva, vista global y retención (Implementado):** Instrumentación best-effort de todas las acciones de liga, vista global `/dashboard/audit` para `super_admin`, exportación a CSV con filtros, búsqueda textual y purga de logs antiguos por retención.
- **Fase 6E - Cierre operativo team_admin al 100% (Implementado):** Administración completa de staff de equipo (`/staff`) con guardrail de último admin, gestión de plantilla/roster (`/roster`) con alta/dorsal/estado/baja, subida de logo de equipo y foto de jugador, captura y eliminación de eventos en partidos de sus equipos (con filtro estricto por equipo), y Hub "Mis equipos" en dashboard.
- **Fase 6F - Cierre operativo coach al 100% (Implementado):** Operación deportiva completa para entrenadores (gestión de jugadores y fotos en liga, alta/dorsal/estado/baja en plantilla de su equipo, captura y eliminación de eventos en sus partidos con filtro por equipo, acceso en Hub "Mis equipos" y bloqueo fail-closed de controles institucionales y de marcador).
- **Fase 6G - Cierre operativo referee al 100% (Implementado):** Operación arbitral completa para árbitros designados (hub "Mis partidos asignados" en `/dashboard/matches` y widget en `/dashboard`, captura y ajuste de resultado con enforcement estricto de trigger RLS `ensure_match_update_scope`, registro y eliminación de eventos deportivos para ambos clubes participantes, formato físico y digital de cédula oficial `/cedula`, panel arbitral en detalle de partido, filtro por partidos asignados en calendario y bloqueo fail-closed de programación, sedes, designaciones y administración institucional o deportiva).
- **Post-MVP Frente 1 - Multi-árbitro: ternas y cuerpo arbitral completo (Implementado):**
  - Tabla `match_officials` con enum de roles (`head_referee`, `first_assistant`, `second_assistant`, `fourth_official`), índices y políticas RLS asociadas.
  - Sincronización automática bidireccional mediante trigger PostgreSQL `sync_match_head_referee` con columna heredada `matches.referee_id` para garantizar 100% de retrocompatibilidad.
  - Actualización de función RLS `can_manage_match` para habilitar a cualquiera de los oficiales del encuentro a gestionar incidencias del partido.
  - Formulario y tarjeta de asignación en UI (`RefereeAssignmentForm` y `RefereeAssignmentCard`) para central, asistentes 1 y 2, y cuarto oficial con insignia `(Tú / Designado)`.
  - Desglose formal del cuerpo arbitral y líneas de firma independientes en la cédula oficial de partido (`/cedula`).
  - Auditoría ampliada con acción `match.officials_updated`.
- **Post-MVP Frente 2 - Disponibilidad y notificaciones de árbitros (Implementado):**
  - Tabla `referee_availabilities` para registrar fechas de indisponibilidad/disponibilidad y notas con RLS estricto (solo árbitro propietario y administradores de liga).
  - Componente y flujo operativo `RefereeAvailabilityManager` en el hub de partidos (`/dashboard/matches`) para registro y eliminación de fechas.
  - Alertas visuales automáticas en los selectores de designación (`RefereeAssignmentForm`) para árbitros que hayan reportado indisponibilidad en la fecha del encuentro.
  - Tabla `user_notifications` y centro de notificaciones in-app (`NotificationBell`) en el header del dashboard con conteo de no leídas, popover interactivo y acción de marcar como leídas.
  - Despacho automático de notificaciones a oficiales al ser asignados o actualizados en un partido vía `updateMatchRefereeAction`.
- **Post-MVP Frentes pendientes:**
  - Frente 3: Auditoría automática (triggers SQL / event-bus sin depender estrictamente de server actions).
  - Frente 4: Media y métricas avanzadas (crop/resize, avatares, múltiples uploads, CDN/custom domain; gráficas y tendencias).

### Media Uploads MVP (Implementado y validado; hardening post-MVP pendiente)
- ✅ Upload de logo de liga, logo de equipo y foto de jugador implementado en dashboard.
- ✅ Validación server-side de MIME/tamaño + registro de metadata en `media_uploads` + auditoría best-effort (`media.*`).
- ✅ Hardening UX: `accept` configurable por tipo de entidad (SVG solo para logos).
- ✅ Bucket `league-media` y policies de Supabase Storage configuradas y verificadas en entorno real (2026-05-19).
- **Post-MVP:** cleanup de huérfanos, borrado físico, crop/resize, múltiples imágenes, avatares y CDN/custom domain.

### Fase 7 - Suscripciones/pagos (Base técnica existente, producto pendiente)
- Tablas base de planes/suscripciones disponibles.
- Pendiente: integración de cobro, lifecycle de suscripción y operación comercial.

---

## Roadmap UI/UX

### Fase 1 - Auditoría inicial (Completado)
Auditoría inicial UI/UX, contraste, CTAs, `focus-visible`, favicon/metadata y correcciones críticas.

### Fase 2 - Consistencia visual estructural (Completado)
Uso de componentes reutilizables:
- `TextLink`
- `Eyebrow`
- `StatusBadge`
- `EmptyState`
- `SectionHeader`
- `PageHeader`
- `MetricCard`
- `FormSectionCard`

### Fase 3 - Pulido dashboard y responsive (Mayormente completado)
Pulido visual/UX del dashboard, responsive, `ToolbarActions`, accesibilidad básica y consistencia de acciones.

### Fase 4 - Auditoría pre-MVP (Completada para MVP)
- ✅ Auditoría visual y responsive de 16 rutas principales (code review).
- ✅ Semántica: `scope="col"` y `title` descriptivos en tabla de standings.
- ✅ Accesibilidad: labels añadidos a inputs sin label (`entity-image-upload`, `referee-assignment`, `league-member-role`).
- ✅ Formularios: help text en `photo_url` de `create-player`; todos los forms principales con labels/errors/pending.
- ✅ Consistencia visual: botones one-off reemplazados por componente `Button` estándar en 3 formularios.
- ✅ Documentación: `docs/QA_UI_UX_PRE_MVP.md` generado.
- **Post-MVP:** QA cross-browser real, E2E automatizado, visual regression tests.

### Fase 5 - QA visual final (Completada para MVP)
- ✅ QA Release Candidate pre-MVP ejecutado (2026-05-19): `docs/QA_RELEASE_CANDIDATE.md`.
- ✅ QA UI/UX pre-MVP ejecutado (2026-05-19): `docs/QA_UI_UX_PRE_MVP.md`.
- ✅ `npm run lint` y `npm run build` en verde tras todos los fixes.
- **Pendiente post-MVP:** QA manual cross-browser con navegador real, QA funcional multi-cuenta por rol, E2E automatizado.


- Referencia: `docs/QA_MEDIA_UPLOADS.md` para QA de Media Uploads MVP.
