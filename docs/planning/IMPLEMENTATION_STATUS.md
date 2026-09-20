# Implementation Status · FutPro Manager

## Resumen ejecutivo

FutPro Manager es una plataforma SaaS multi-tenant para la administración y seguimiento de ligas amateur de fútbol. La plataforma cuenta con un núcleo deportivo completo, seguridad estricta basada en RLS (Row Level Security), control de acceso por roles (RBAC) con comportamiento fail-closed, consola global para el super administrador, portal público para aficionados con estadísticas avanzadas y generación dinámica de tarjetas sociales, y una experiencia móvil optimizada con soporte PWA y **Modo Cancha** para el cuerpo arbitral.

### Estado operativo por áreas principales:
- **Autenticación y Cuentas:** Login, recuperación de contraseña, nuevo formulario interactivo de registro (`/login?mode=register`) con selector de rol y medidor de seguridad, protección de rutas y suspensión de cuentas con cierre forzado de sesión (`is_suspended`).
- **Núcleo Deportivo (100% operativo):** Ligas, temporadas, clubes, plantillas, jugadores, sedes, partidos (con terna arbitral completa), marcadores en vivo y finalizados, registro y eliminación de eventos deportivos.
- **Tabla de Posiciones (Hardening MVP):** Recálculo automático al finalizar partidos, recálculo manual para administradores de liga, historial de recálculos auditado y consistencia garantizada.
- **Roles y Permisos (100% de cobertura operativa):** `super_admin` (100%), `league_admin` (100%), `team_admin` (100%), `coach` (100%), `referee` (100%) y `viewer` (100%).
- **Consola Global Super Admin (100% operativa):** Directorio de usuarios, administración de roles globales, suspensión/reactivación de cuentas, consola de almacenamiento con RPCs, avisos masivos in-app (broadcast), bandeja y purga de mensajes de contacto, moderación de ciclo de vida de ligas y purga de retención de auditoría.
- **Portal Público y Conversión (100% operativo):** Landing comercial con glassmorphism deportivo, animaciones reveal, contadores animados, explorador de ligas, tabla con streaming Suspense e ISR, directorio de equipos, fichas de jugadores, estadísticas agregadas de goleo/asistencias/vallas/fair play y OpenGraph dinámico (`next/og`).
- **Experiencia Móvil y PWA (100% operativa):** Web App Manifest, iconos maskable, barra de navegación inferior (`BottomNav`) adaptada por rol, y **Modo Cancha** (controles táctiles numéricos `+`/`-`, botones de eventos con objetivo táctil >= 44px, y cédula en pestañas móviles).
- **Multimedia y Almacenamiento:** Bucket `league-media` con subida, avatar en perfil de usuario, galería por liga con limpieza de archivos huérfanos, y consola global de storage.

---

## Leyenda de estado

- **Implementado**: existe ruta, UI, lógica de negocio y pruebas verificables en el repositorio.
- **Parcial**: existe implementación funcional útil, pero con aspectos complementarios pendientes.
- **Pendiente**: planificado con diseño definido, a la espera de ejecución.
- **Base técnica existente**: existe en schema/RLS/tipos sin interfaz o lógica de aplicación completa.

---

## Estado detallado por módulo

### 1. Autenticación y Cuentas
- **Estado:** Implementado al 100%.
- **Evidencia en repo:** `app/login/page.tsx`, `components/auth/login-form.tsx`, `proxy.ts`, `lib/auth/auth-utils.ts`, `lib/auth/auth-utils.test.ts`.
- **Funcionalidad existente:**
  - Login y registro unificados en `/login` y `/login?mode=register`.
  - Formulario de registro con selector de perfil (`Aficionado`, `Jugador`, `Cuerpo técnico`, `Directivo`), indicador de seguridad de contraseña en tiempo real, confirmación de clave y validaciones amigables.
  - Verificación de suspensión de cuenta (`is_suspended`): usuarios suspendidos son redirigidos a `/login?suspended=1` con invalidación inmediata de sesión en `proxy.ts`.
  - Recuperación y actualización de contraseñas (`/update-password`).

### 2. Panel Principal (Dashboard) y Métricas
- **Estado:** Implementado al 100%.
- **Evidencia en repo:** `app/dashboard/page.tsx`, `components/dashboard/header.tsx`, `components/dashboard/sidebar.tsx`, `components/dashboard/mobile-nav.tsx`, `components/dashboard/dashboard-trends-chart.tsx`, `components/dashboard/platform-metrics-card.tsx`.
- **Funcionalidad existente:**
  - KPIs principales: ligas activas, equipos, futbolistas y próximos partidos.
  - Componente de tendencias y analítica (`DashboardTrendsChart`): ritmo goleador, avance de calendario, disciplina/fair play y gráfica SVG interactiva de goles y partidos por jornada.
  - Widget de métricas de plataforma para `super_admin` (`PlatformMetricsCard`): nuevos registros, ligas y actividad en los últimos 7 días.
  - Navegación responsive: Sidebar completo en desktop y BottomNav contextual por rol en móvil con drawer "Más".

### 3. Ligas y Ciclo de Vida
- **Estado:** Implementado al 100%.
- **Evidencia en repo:** `app/dashboard/leagues/page.tsx`, `app/dashboard/leagues/[slug]/page.tsx`, `app/dashboard/leagues/admin/page.tsx`, `components/leagues/*`.
- **Funcionalidad existente:**
  - Creación, listado, edición y consulta de detalle de ligas.
  - Consola de ciclo de vida global para `super_admin` (`/dashboard/leagues/admin`): control de estados (`draft`, `active`, `inactive`, `archived`) y visibilidad pública con auditoría `league.status_updated`.

### 4. Temporadas
- **Estado:** Implementado al 100%.
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/seasons/page.tsx`, `app/dashboard/leagues/[slug]/seasons/[seasonSlug]/page.tsx`, `components/seasons/*`.
- **Funcionalidad existente:** Alta, listado, configuración de fechas y detalle de temporadas por liga.

### 5. Equipos y Staff
- **Estado:** Implementado al 100% (cobertura total para `league_admin` y `team_admin`).
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/teams/page.tsx`, `app/dashboard/leagues/[slug]/teams/[teamSlug]/edit/page.tsx`, `app/dashboard/leagues/[slug]/teams/[teamSlug]/staff/`, `app/dashboard/leagues/[slug]/teams/[teamSlug]/roster/`, `components/teams/*`.
- **Funcionalidad existente:**
  - Alta, edición, estado y subida de escudo con recorte 1:1.
  - Gestión integral de staff (`team_members`): asignación de `team_admin` y `coach` con guardrail que impide remover al último administrador del club.
  - Gestión de plantilla deportiva (`/roster`) y Hub "Mis equipos" con accesos directos.

### 6. Jugadores y Plantillas
- **Estado:** Implementado al 100%.
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/players/page.tsx`, `app/dashboard/leagues/[slug]/players/[playerId]/page.tsx`, `app/dashboard/leagues/[slug]/players/[playerId]/registrations/page.tsx`, `components/players/*`, `components/registrations/*`.
- **Funcionalidad existente:**
  - Ficha deportiva del jugador (pie dominante, posición, fecha de nacimiento, foto con recorte 3:4).
  - Inscripción en temporadas con número de dorsal y validación de consistencia de liga por trigger.
  - Acceso habilitado tanto para `league_admin` como para `team_admin` y `coach` de su club.

### 7. Partidos, Terna Arbitral y Cédula
- **Estado:** Implementado al 100% (cobertura total para `league_admin` y `referee`).
- **Evidencia en repo:** `app/dashboard/matches/page.tsx`, `app/dashboard/leagues/[slug]/matches/page.tsx`, `app/dashboard/leagues/[slug]/matches/[matchId]/page.tsx`, `app/dashboard/leagues/[slug]/matches/[matchId]/cedula/page.tsx`, `components/matches/*`, `components/referees/*`.
- **Funcionalidad existente:**
  - Programación de partidos con sede, fecha/hora y jornada.
  - Designación de terna arbitral completa (`match_officials`): árbitro central, asistentes 1 y 2, y cuarto oficial.
  - Gestión de indisponibilidad arbitral (`referee_availabilities`) y notificaciones automáticas al designar.
  - Hub "Mis partidos asignados" para árbitros con acceso directo al acta y cédula.
  - Facultad para que cualquier árbitro colegiado de la liga pueda oficiar partidos sin asignación previa.
  - Generación de cédula oficial de partido imprimible y digital con alineaciones, incidencias y firmas.

### 8. Resultados, Eventos y Modo Cancha
- **Estado:** Implementado al 100%.
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/matches/[matchId]/result/page.tsx`, `app/dashboard/leagues/[slug]/matches/[matchId]/events/page.tsx`, `components/matches/match-result-form.tsx`, `components/matches/create-match-event-form.tsx`, `components/matches/mobile-cedula-tabs.tsx`.
- **Funcionalidad existente:**
  - Captura y ajuste de marcador en vivo (`live`) y finalizado (`completed`).
  - **Modo Cancha táctil:** steppers táctiles de incremento/decremento (`+`/`-`) para goles locales y visitantes, optimizados para uso con una sola mano en campo.
  - Registro de eventos deportivos (goles, tarjetas amarillas/rojas, autogoles, sustituciones y penales) con minuto y notas reglamentarias.
  - Control de alcance: árbitros registran incidencias de ambos clubes; entrenadores/delegados registran únicamente las de su propio equipo.
  - Cédula móvil organizada en pestañas táctiles (`Resumen`, `Alineaciones`, `Eventos`, `Firmas`).

### 9. Tabla de Posiciones (Standings)
- **Estado:** Implementado con Hardening MVP.
- **Evidencia en repo:** `app/dashboard/leagues/[slug]/standings/page.tsx`, `app/dashboard/leagues/[slug]/seasons/[seasonSlug]/standings/actions.ts`, `components/standings/*`.
- **Funcionalidad existente:**
  - Recálculo automático al finalizar partidos (`completed`) o modificar marcadores cerrados.
  - Botón de recálculo manual para administradores de liga con reporte detallado de filas procesadas.
  - Historial de los últimos recálculos visibles en interfaz mediante registros de auditoría.
  - Dual layout: tarjetas táctiles en dispositivos móviles y tabla relacional en pantallas de escritorio.

### 10. Consola Global del Super Administrador
- **Estado:** Implementado al 100%.
- **Evidencia en repo:** `app/dashboard/users/`, `app/dashboard/storage/`, `app/dashboard/notifications/broadcast/`, `app/dashboard/contact-messages/`, `app/dashboard/audit/`, `app/dashboard/leagues/admin/`.
- **Funcionalidad existente:**
  - **Cuentas de usuario:** Directorio con buscador server-side, visualización de correos de `auth.users`, membresías activas, cambio de rol global y suspensión/rehabilitación de cuentas con guardrail anti-autodegradación.
  - **Promoción de Super Admins:** Asignación segura del rol `super_admin` con frase de confirmación obligatoria.
  - **Consola de almacenamiento:** Métricas de bytes y objetos del bucket `league-media`, buscador por ruta y borrado permanente auditado vía RPC `admin_delete_storage_object`.
  - **Avisos masivos (Broadcast):** Envío de notificaciones in-app a toda la plataforma o segmentadas por rol con vista previa e inserción en lotes de 200.
  - **Bandeja de contacto:** Lectura de mensajes del formulario público, métricas y purga por retención vía RPC `admin_purge_contact_messages`.
  - **Auditoría global:** Retención y purga de logs antiguos (90/180/365 días) vía RPC `admin_purge_audit_logs` con exportación completa a CSV.

### 11. Portal Público y SEO
- **Estado:** Implementado al 100%.
- **Evidencia en repo:** `app/page.tsx`, `app/explorar/page.tsx`, `app/contacto/page.tsx`, `app/liga/[slug]/`, `app/opengraph-image.tsx`, `app/liga/[slug]/opengraph-image.tsx`, `components/public/*`, `components/stats/*`.
- **Funcionalidad existente:**
  - Portada comercial deportiva con contadores dinámicos, animaciones reveal, acordeón FAQ y estadísticas en vivo.
  - Navegación pública unificada (`PublicNav`): Resumen, Tabla, Estadísticas, Partidos y Equipos.
  - Módulo completo de estadísticas de temporada (`/stats`): goleadores, asistentes, vallas invictas, fair play y promedios.
  - Directorio público de clubes (`/teams`) y detalle de plantilla.
  - Detalle de partido con timeline interactivo de eventos y badge EN VIVO pulsante.
  - Generación dinámica de tarjetas OpenGraph (`next/og`) de 1200x630 para compartir en redes sociales.

### 12. PWA y Optimización Móvil
- **Estado:** Implementado al 100%.
- **Evidencia en repo:** `app/manifest.ts`, `public/icons/*`, `components/dashboard/mobile-nav.tsx`, `app/globals.css`.
- **Funcionalidad existente:**
  - Manifiesto PWA completo con iconos 192x192, 512x512 maskable y apple-touch-icon para instalación nativa en iOS/Android.
  - Viewport fit cover, safe areas CSS (`env(safe-area-inset-bottom)`) y prevención de auto-zoom en iOS Safari (`font-size: 16px` en inputs).
  - BottomNav fija en móvil por rol + drawer "Más".
  - Resolución de colisiones z-index entre CookieBanner, WhatsApp flotante y pie de página.

### 13. Auditoría y Trazabilidad
- **Estado:** Implementado al 100%.
- **Evidencia en repo:** `lib/audit/*`, `app/dashboard/leagues/[slug]/audit/`, `app/dashboard/audit/`, `supabase/migrations/20260916073000_automatic_audit_triggers.sql`.
- **Funcionalidad existente:**
  - Instrumentación best-effort en Server Actions.
  - Triggers SQL automáticos en PostgreSQL (`trg_auto_audit_log`) en tablas clave (`matches`, `match_events`, `match_officials`, `team_members`, `player_team_registrations`).
  - Filtros por acción, entidad, actor y fechas con búsqueda textual y exportación a CSV.

### 14. Módulo Tutoriales por Rol (MVP)
- **Estado:** Implementado al 100%.
- **Evidencia en repo:**
  - Schema & Migraciones: `supabase/migrations/20260920160000_tutorials.sql` (tablas `tutorials` + `tutorial_steps`, índices GIN, triggers `set_updated_at`, RLS select autenticado + escritura admin, policy storage `tutorials/%`).
  - Semilla: `supabase/migrations/20260920161000_tutorials_seed.sql` (12 tutoriales semilla con pasos y FAQ redactados de guías reales).
  - Tipos: `types/database.ts` (`Tutorial`, `TutorialStep`, `TutorialWithSteps`, `TutorialFaqItem`).
  - Lógica y Seguridad: `lib/tutorials/roles.ts`, `lib/tutorials/queries.ts`, `lib/tutorials/queries.test.ts` (23 tests vitest).
  - Rutas: `app/dashboard/ayuda/page.tsx` (lista con searchParams y filtros reactivos), `app/dashboard/ayuda/[slug]/page.tsx` (detalle con fail-closed `notFound()`), `app/dashboard/ayuda/actions.ts`.
  - Componentes: `components/help/TutorialCard.tsx`, `components/help/TutorialFilters.tsx` ("use client"), `components/help/TutorialStepView.tsx` (Markdown sanitizado JSX puro, next/image, video mp4), `components/help/TutorialFaq.tsx` (acordeón accesible).
  - Integración Nav & Contextual: Enlace en `components/dashboard/navigation-config.ts` para todos los roles; accesos contextuales en `RefereeAssignmentCard` y `roster/page.tsx`.

---

## Cobertura de Roles Operativos

| Rol | Cobertura | Alcance y Capacidades Operativas |
|---|---|---|
| **`super_admin`** | 100% | Consola global completa: usuarios, roles, suspensiones, storage, avisos masivos, contacto, purga de auditoría, ciclo de vida de ligas y tutoriales globales. |
| **`league_admin`** | 100% | Gestión integral de liga: temporadas, clubes, sedes, partidos, designación de ternas arbitrales, miembros, auditoría, recálculo de tabla y tutoriales administrativos y de roles subordinados. |
| **`team_admin`** | 100% | Gestión de club: escudo, datos, staff (con protección de último admin), plantilla de jugadores, eventos y tutoriales de administración de equipo y coach. |
| **`coach`** | 100% | Operación deportiva: fichas de jugadores, inscripciones, dorsales, eventos de los partidos de su club y tutoriales de convocatoria y captura deportiva. |
| **`referee`** | 100% | Operación arbitral: designaciones en terna, calendario de disponibilidad, hubs de partidos, Modo Cancha táctil, captura de resultados/eventos, cédula oficial y tutoriales arbitrales. |
| **`viewer`** | 100% | Consulta informativa en dashboard sin permisos de mutación y tutoriales de exploración pública general. |

---

## Pendientes Próximos (Horizonte Post-MVP)

1. **Pipeline event-driven desacoplado para standings:** Migrar el recálculo a un job worker encolado o trigger SQL asíncrono para desacoplarlo completamente de la petición HTTP del guardado de resultado.
2. **Suite automatizada E2E (Playwright):** Implementar pruebas automáticas multi-sesión para validar flujos cruzados de árbitros, administradores y delegados en navegador headless integrado a CI.
3. **Pasarela de cobro comercial para SaaS:** Integrar pasarela de pago (Stripe o MercadoPago) para automatizar el cobro de suscripciones de ligas, complementando el módulo de licenciamiento manual existente.

---

## Última actualización

- **Fecha:** 2026-09-20
- **Branch:** `main`
- **Estado de suites:**
  - Vitest: **160/160 tests en verde (100% passing across 27 suites)**.
  - ESLint: **0 errores**.
  - TypeScript: Compilación limpia sin errores de tipos (`npm run build` exitoso).
- **Hitos completados en este ciclo:**
  - Implementación completa del Módulo Tutoriales por Rol (Fases 0 a 6).
  - RLS fail-closed y aislamiento seguro por roles en la base de datos y server actions.
  - 12 tutoriales iniciales con contenido preciso derivado de las guías de usuario reales.
