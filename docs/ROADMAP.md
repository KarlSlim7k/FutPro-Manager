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

### Fase 4 - Tabla de posiciones (Implementación funcional, con mejoras pendientes)
- Vista de standings implementada y conectada a datos reales.
- Existe recálculo manual por temporada en dashboard.
- Existe recálculo automático al guardar resultados que impactan estado `completed`.
- **Pendiente:** automatización avanzada por eventos/auditoría y soporte de jobs/background para mayor robustez.

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
- Pendiente: asignaciones avanzadas con historial, permisos granulares por feature, consola completa de roles.

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

### Fase 4 - Auditoría pre-MVP (Parcial)
Semántica, links externos, controles de formulario, densidad mobile y documentación del sistema visual.

### Fase 5 - QA visual final (Pendiente)
Revisión cross-browser/manual, checklist de release y preparación para pruebas con usuarios reales.
