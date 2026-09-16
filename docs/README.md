# Índice de Documentación Técnica · FutPro Manager

Bienvenido al centro de documentación técnica, arquitectura y control de calidad de **FutPro Manager**. Aquí encontrarás la referencia completa del sistema organizada por áreas de responsabilidad.

---

## 1. Arquitectura, Datos e Infraestructura

Documentos base para comprender la estructura del proyecto, el esquema de datos y las políticas de seguridad:

* **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Arquitectura general del sistema, separación de capas (Server Components, Client Components, Server Actions), flujo de datos y dependencias clave.
* **[DATABASE.md](./DATABASE.md)**: Esquema de base de datos relacional en PostgreSQL/Supabase, claves foráneas, triggers de recálculo y políticas RLS principales.
* **[INFRASTRUCTURE.md](./INFRASTRUCTURE.md)**: Plataformas de despliegue (Vercel + Supabase), servicios en la nube y configuración de variables de entorno.
* **[ROLES_AND_PERMISSIONS.md](./ROLES_AND_PERMISSIONS.md)**: Matriz completa de autorización RBAC (superadmin, league_admin, team_admin, referee, viewer), permisos por módulo y seguridad en base de datos.
* **[STORAGE_SETUP.md](./STORAGE_SETUP.md)**: Configuración del bucket `league-media`, políticas de subida, límites de tamaño y aislamiento de archivos por liga.
* **[DESIGN.md](./DESIGN.md)**: Sistema de diseño, paleta de colores, tipografía, glassmorphism, componentes base y lineamientos UX/UI para móvil y escritorio.
* **[RULES.md](./RULES.md)**: Reglas de codificación, convenciones de nomenclatura, buenas prácticas de desarrollo y estándares de calidad.

---

## 2. Planificación, Estado y Producto

Documentos de seguimiento del desarrollo y visión del producto:

* **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)**: Estado detallado de implementación módulo por módulo (completado, parcial o pendiente).
* **[ROADMAP.md](./ROADMAP.md)**: Hoja de ruta estratégica de versiones, etapas de lanzamiento (MVP, Fase 2, SaaS multi-liga) y backlog priorizado.
* **[PLAN_UX_UI.md](./PLAN_UX_UI.md)**: Plan de trabajo de diseño visual, optimización de conversión de landing pública y consistencia responsive.
* **[AI_CONTEXT.md](./AI_CONTEXT.md)**: Guía rápida y contexto condensado del proyecto para asistentes y agentes de inteligencia artificial.

---

## 3. Informes de Aseguramiento de Calidad y Seguridad (QA)

Reportes de pruebas manuales, auditorías y validaciones de despliegue ubicados en [`docs/qa/`](./qa):

* **[QA_SECURITY_AUDIT.md](./qa/QA_SECURITY_AUDIT.md)**: **Auditoría de seguridad consolidada** con resolución de hallazgos HIGH (Storage, XSS, URL schemes, elegibilidad/resultados), MEDIUM (Audit logs, PostgREST filter injection, auth enumeration, rate limiting) y LOW.
* **[QA_RELEASE_CANDIDATE.md](./qa/QA_RELEASE_CANDIDATE.md)**: Consolidado de validación previo a Release Candidate pre-MVP.
* **[QA_AUDIT_LOGS.md](./qa/QA_AUDIT_LOGS.md)**: Evidencia y validación del sistema de auditoría y exportación CSV.
* **[QA_MEDIA_UPLOADS.md](./qa/QA_MEDIA_UPLOADS.md)**: Pruebas del módulo de subida, recorte y almacenamiento de imágenes.
* **[QA_PERMISSIONS_UX.md](./qa/QA_PERMISSIONS_UX.md)**: Verificación de controles de interfaz según el rol del usuario autenticado.
* **[QA_PUBLIC_VIEWS.md](./qa/QA_PUBLIC_VIEWS.md)**: Pruebas de navegación pública y vistas sin sesión iniciada.
* **[QA_RESPONSIVE_PERMISSIONS.md](./qa/QA_RESPONSIVE_PERMISSIONS.md)**: Validación de diseño adaptable en móvil, tablet y PC.
* **[QA_STANDINGS_HARDENING.md](./qa/QA_STANDINGS_HARDENING.md)**: Pruebas de robustez y disparadores de recálculo de tabla de posiciones.
* **[QA_STANDINGS_RESULTS.md](./qa/QA_STANDINGS_RESULTS.md)**: Validación de consistencia matemática entre resultados de partidos y posiciones.
* **[QA_UI_UX_PRE_MVP.md](./qa/QA_UI_UX_PRE_MVP.md)**: Auditoría de usabilidad, contraste, semántica y accesibilidad visual.
