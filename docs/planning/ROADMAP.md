# Roadmap · FutPro Manager

## Roadmap de Producto

### Fase 0 - Base Técnica (Completado)
- Setup de stack (Next.js 15+ App Router, TypeScript, Tailwind CSS, Supabase PostgreSQL).
- Autenticación inicial con Supabase Auth.
- Esquema relacional base y RLS inicial en migraciones versionadas.
- Base multi-tenant por liga con aislamiento vía `league_id` y slugs semánticos.

### Fase 1 - Dashboard y Administración Base (Completado)
- Dashboard autenticado y navegación principal contextual.
- Listado, alta y detalle de ligas.
- Gestión base operativa de entidades por liga.

### Fase 2 - Temporadas, Equipos y Jugadores (Completado)
- Temporadas: listado, alta, configuración y detalle.
- Equipos: alta, edición, escudo/logo con recorte 1:1, administración de staff y gestión de plantilla (`/roster`).
- Jugadores: fichas completas, fotos 3:4 e inscripciones por temporada con validación de consistencia.

### Fase 3 - Partidos, Resultados y Eventos (Completado)
- Partidos: programación, edición, detalle y asignación de terna arbitral completa.
- Resultados: captura de marcador en vivo y finalizado.
- Eventos: registro reglamentario de incidencias (goles, tarjetas, autogoles, sustituciones y penales) con control estricto de autoría y alcance por rol.
- Cédula oficial: generación e impresión del acta digital del encuentro con desglose del cuerpo arbitral y líneas de firma.

### Fase 4 - Tabla de Posiciones con Hardening (Completado)
- Vista de posiciones conectada a datos reales de Supabase.
- Recálculo manual por temporada en dashboard con resumen detallado de filas.
- Recálculo automático instantáneo al guardar resultados en estado `completed`.
- Auditoría best-effort de recálculos (`standings.recalculated_manual`, `standings.recalculated_auto`, `standings.recalculate_failed`).
- Manejo de inconsistencias y revalidación de caché en rutas públicas e internas.

### Fase 5 - Portal Público, Estadísticas Avanzadas y SEO (Completado)
- Portal público completo para aficionados: portada comercial, explorador de ligas, tabla, calendario, detalle de partido, directorio de clubes y fichas de futbolistas.
- Módulo avanzado de estadísticas agregadas (`/liga/[slug]/stats`): tabla de goleo individual, máximos asistentes, vallas invictas por equipo, fair play y métricas globales de temporada.
- Generación dinámica de tarjetas sociales OpenGraph (`next/og`) de 1200x630 para compartir en redes.
- Streaming Suspense con ISR para carga instantánea de la tabla de posiciones.

### Fase 6 - Consola Global, Roles al 100%, PWA y Modo Cancha (Completado)
- **Fase 6A - Administración de miembros por liga:** Gestión de roles de miembros con guardrails de seguridad y protección de último administrador.
- **Fase 6B - Asignación arbitral:** Designación de árbitro principal y oficiales desde el detalle de encuentro.
- **Fase 6C & 6D - Auditoría integral:** Vista por liga y global multi-liga, exportación a CSV respetando filtros, búsqueda textual y purga de logs antiguos por retención.
- **Fase 6E - Cierre operativo `team_admin` (100%):** Gestión de escudo, staff (`team_members`), plantilla (`/roster`), eventos de sus partidos y Hub "Mis equipos".
- **Fase 6F - Cierre operativo `coach` (100%):** Gestión deportiva de jugadores, dorsales, plantilla y eventos de sus partidos, con bloqueo fail-closed de controles institucionales.
- **Fase 6G - Cierre operativo `referee` (100%):** Hub "Mis partidos asignados", widget de inicio, panel arbitral, captura y ajuste de resultado con trigger RLS `ensure_match_update_scope`, eventos de ambos equipos y emisión de cédula oficial.
- **Fase 6H - Consola global del `super_admin` (100%):**
  - Directorio de usuarios (`/dashboard/users`), cambio de rol global, suspensión/rehabilitación de cuentas con cierre forzado de sesión (`is_suspended`), y promoción segura de super admins con confirmación obligatoria.
  - Consola de almacenamiento (`/dashboard/storage`) con RPCs para estadísticas por bucket y borrado definitivo auditado.
  - Avisos masivos / broadcast (`/dashboard/notifications/broadcast`) in-app segmentados por rol o globales con lotes de 200.
  - Bandeja y purga de mensajes de contacto (`/dashboard/contact-messages`) del formulario público.
  - Moderación global del ciclo de vida de ligas (`/dashboard/leagues/admin`) con auditoría `league.status_updated`.
  - Retención y purga global de logs de auditoría (90/180/365 días) vía RPC `admin_purge_audit_logs`.
- **Fase 6I - Experiencia Móvil, PWA y Modo Cancha (100%):**
  - Manifiesto PWA (`app/manifest.ts`) e iconos maskable para instalación como app nativa en iOS y Android.
  - Barra de navegación inferior (`BottomNav`) fija con 4 accesos rápidos contextuales por rol + drawer lateral "Más".
  - **Modo Cancha para celular:** steppers numéricos táctiles `+`/`-` para marcador, botones de eventos con tap target >= 44px, y cédula en pestañas móviles (`MobileCedulaTabs`).
  - Dual layout de posiciones: cards móviles táctiles (`StandingMobileCard`) y tabla densa en desktop.
- **Fase 6J - Rediseño Visual Deportivo y Conversión (100%):**
  - Estética deportiva oscura con efectos glassmorphism.
  - Portada con animaciones reveal al scroll, contadores métricos animados y acordeón interactivo FAQ.
  - Nuevo formulario de registro interactivo (`/login?mode=register`) con selector de perfil y medidor de seguridad de contraseña en tiempo real.
- **Frentes Post-MVP 1, 2, 3 y 4 (Completados):**
  - Multi-árbitro con ternas completas (`match_officials`) y sincronización bidireccional por trigger.
  - Disponibilidad arbitral (`referee_availabilities`) y centro de notificaciones in-app (`user_notifications`).
  - Triggers SQL automáticos (`trg_auto_audit_log`) non-blocking en PostgreSQL.
  - Recorte interactivo client-side (HTML5 Canvas), avatares de perfil (`/dashboard/profile`) y galería de liga (`/media`).

### Fase 7 - Próximo Horizonte (Post-MVP)
- **7.1 Pipeline Event-Driven para Standings:** Migración del recálculo de tabla a workers en segundo plano o triggers SQL asíncronos para desacoplarlo totalmente del guardado de marcadores.
- **7.2 Automatización E2E Multi-Cuenta (Playwright):** Suite de pruebas en navegador headless para verificar concurrencia, guardrails y navegación entre roles en CI.
- **7.3 Pasarela de Pagos SaaS (Stripe / MercadoPago):** Automatización de cobro recurrente de planes y facturación electrónica, extendiendo el módulo actual de licenciamiento manual.

---

## Roadmap de UX / UI

- ✅ **Fase 1:** Quick wins de conversión y copy (eliminación de texto interno "MVP", CTAs comerciales, soporte para `/login?mode=register`).
- ✅ **Fase 2:** Estructura visual de landing (mockups de producto, beneficios escaneables, animación reveal, contadores numéricos).
- ✅ **Fase 3:** Descubribilidad y navegación pública (breadcrumbs en vistas públicas y ruta dedicada `/liga/[slug]/teams`).
- ✅ **Fase 4:** Pulido responsive y accesibilidad (labels semánticos, `focus-visible`, objetivos táctiles >= 44px, safe areas iOS).
- ✅ **Fase 5:** PWA y Modo Cancha (instalabilidad en móvil, steppers táctiles para marcadores, cédula en tabs y BottomNav por rol).
