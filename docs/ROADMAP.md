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

### Fase 5 - Vista pública (Parcialmente completado)
- ✅ Portal público mínimo: resumen de liga, tabla de posiciones, calendario de partidos, detalle público de partido y detalle público de equipo.
- ✅ Navegación de consulta para aficionados entre vistas públicas.
- ✅ QA público real validado con datos reales de Supabase/RLS (2026-05-04).
- Pendiente: detalle público de jugador, eventos públicos avanzados, filtros avanzados, SEO/social previews.

### Fase 6 - Roles avanzados, árbitros, auditoría (Base técnica + hardening UX implementado, UI de administración pendiente)
- Modelo base en schema/RLS.
- Hardening UX de permisos en dashboard implementado: helper `getLeaguePermissions` y ocultamiento de CTAs administrativas según rol.
- Pendiente: administración UI de permisos granulares, asignaciones avanzadas, consola de roles y consulta de auditoría.

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
