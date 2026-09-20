# Centro de Documentación · FutPro Manager

Bienvenido al centro de documentación técnica, arquitectura, guías de usuario y control de calidad de **FutPro Manager**. Toda la documentación del proyecto está organizada en subcarpetas especializadas por área de responsabilidad.

---

## Estructura de la Documentación

```txt
docs/
├── README.md           ← Este índice central
├── user-guide/         ← Guías para usuarios finales (por rol y portal público)
├── developer/          ← Guía de onboarding para desarrolladores
├── architecture/       ← Referencia técnica: sistema, datos e infraestructura
├── guidelines/         ← Sistema de diseño y estándares de código
├── planning/           ← Planificación, estado del producto, roadmap y plan de mejoras
├── prompts/            ← Catálogo de prompts, agentes de IA y contexto del sistema
└── qa/                 ← Reportes de aseguramiento de calidad y seguridad
```

---

## 0. Guías para Usuarios Finales (`user-guide/`)

Documentación funcional en lenguaje no técnico para operar la plataforma según el rol asignado:

* **[Índice y glosario](./user-guide/README.md)**: mapa de roles, glosario de términos y estados del sistema.
* **[Primeros pasos](./user-guide/PRIMEROS_PASOS.md)**: registro con validaciones de seguridad, inicio de sesión, perfil, roles e instalación PWA en móviles.
* **[Portal público](./user-guide/PORTAL_PUBLICO.md)**: guía para aficionados (explorador de ligas, tabla, estadísticas avanzadas, calendario y perfiles).
* **[Administrador de liga](./user-guide/GUIA_ADMIN_LIGA.md)**: operación completa de una liga (temporadas, clubes, sedes, árbitros, auditoría y recálculo).
* **[Equipos](./user-guide/GUIA_EQUIPOS.md)**: gestión institucional (`team_admin`) y deportiva (`coach`) de club, staff, escudo, plantilla y eventos.
* **[Árbitros](./user-guide/GUIA_ARBITRAJE.md)**: designaciones, captura de resultados, Modo Cancha para celular, eventos y emisión de cédula oficial.
* **[Administrador de plataforma](./user-guide/GUIA_ADMIN_PLATAFORMA.md)**: consola global de administración (`super_admin`): cuentas, storage, avisos masivos, contacto, purga de auditoría y ciclo de vida de ligas.

---

## 1. Guía para Desarrolladores (`developer/`)

* **[DEVELOPER_GUIDE.md](./developer/DEVELOPER_GUIDE.md)**: onboarding técnico — setup local, variables de entorno, estructura del repositorio, mapa de módulos del dashboard, patrones clave (Server Actions, RBAC fail-closed, auditoría SQL y de aplicación), comandos de verificación y despliegue.
* **[MODULO_TUTORIALES_IMPLEMENTATION.md](./developer/MODULO_TUTORIALES_IMPLEMENTATION.md)**: guía paso a paso para implementar el módulo Tutoriales (fases, archivos, errores comunes y verificación).

---

## 2. Arquitectura, Datos e Infraestructura (`architecture/`)

Documentos base para comprender la estructura del proyecto, el esquema de datos y las políticas de seguridad:

* **[ARCHITECTURE.md](./architecture/ARCHITECTURE.md)**: Arquitectura general del sistema, separación de capas (Server Components, Client Components, Server Actions), flujo de datos y dependencias clave.
* **[DATABASE.md](./architecture/DATABASE.md)**: Esquema de base de datos relacional en PostgreSQL/Supabase, claves foráneas, triggers de recálculo, funciones de seguridad y RPCs de administración.
* **[INFRASTRUCTURE.md](./architecture/INFRASTRUCTURE.md)**: Plataformas de despliegue (Vercel + Supabase), servicios en la nube y configuración de variables de entorno.
* **[ROLES_AND_PERMISSIONS.md](./architecture/ROLES_AND_PERMISSIONS.md)**: Matriz completa de autorización RBAC (super_admin, league_admin, team_admin, coach, referee, viewer), permisos por módulo y seguridad en base de datos.
* **[STORAGE_SETUP.md](./architecture/STORAGE_SETUP.md)**: Configuración del bucket `league-media`, políticas de subida, límites de tamaño, optimización de avatares y aislamiento de archivos.
* **[MODULO_TUTORIALES_ARCHITECTURE.md](./architecture/MODULO_TUTORIALES_ARCHITECTURE.md)**: Arquitectura del módulo Tutoriales (schema, RLS, Storage, rutas, componentes y mapa de lectura para IA).

---

## 3. Sistema de Diseño y Estándares (`guidelines/`)

Lineamientos visuales y de codificación que todo contribuidor debe seguir:

* **[DESIGN.md](./guidelines/DESIGN.md)**: Sistema de diseño, paleta de colores deportiva oscura, tipografía Inter, glassmorphism, componentes base y lineamientos UX/UI para móvil y escritorio.
* **[RULES.md](./guidelines/RULES.md)**: Reglas de codificación, convenciones de nomenclatura, buenas prácticas de desarrollo y estándares de calidad.
* **[MODULO_TUTORIALES_CONTENT_GUIDE.md](./guidelines/MODULO_TUTORIALES_CONTENT_GUIDE.md)**: Estándares de redacción de tutoriales (pasos, FAQ, gifs/videos) para redactores y agentes IA.

---

## 4. Planificación, Estado y Producto (`planning/`)

Documentos de seguimiento del desarrollo y visión del producto:

* **[IMPLEMENTATION_STATUS.md](./planning/IMPLEMENTATION_STATUS.md)**: Estado detallado de implementación módulo por módulo (completado, parcial o pendiente).
* **[ROADMAP.md](./planning/ROADMAP.md)**: Hoja de ruta estratégica de fases de desarrollo (Fases 0 a 6 completadas, Fase 7 próxima) y backlog priorizado.
* **[IMPROVEMENT_PLAN.md](./planning/IMPROVEMENT_PLAN.md)**: Plan de mejoras priorizado (P0–P3) con criterios de aceptación, decisiones abiertas y secuencia sugerida.
* **[PLAN_UX_UI.md](./planning/PLAN_UX_UI.md)**: Plan de trabajo de diseño visual, optimización de conversión de landing pública, experiencia móvil PWA y consistencia de interfaz.
* **[MODULO_TUTORIALES_SPEC.md](./planning/MODULO_TUTORIALES_SPEC.md)**: SPEC funcional del módulo Tutoriales por rol (alcance MVP, tutoriales semilla, visibilidad y criterios de aceptación).

---

## 5. Prompts y Contexto para Agentes de IA (`prompts/`)

Recursos para desarrollo asistido por modelos de lenguaje e inteligencia artificial:

* **[Catálogo de Prompts y Agentes](./prompts/README.md)**: Inventario de los 8 prompts (`create-*`), 7 agentes especializados (`solution-architect`, `supabase-expert`, etc.), 4 instrucciones técnicas y flujo de trabajo sugerido.
* **[MODULO_TUTORIALES_PROMPTS.md](./prompts/MODULO_TUTORIALES_PROMPTS.md)**: Prompts copy-paste para agentes IA + mapa de dónde buscar cada cosa del módulo Tutoriales.
* **[AI_CONTEXT.md](./prompts/AI_CONTEXT.md)**: Guía rápida y contexto condensado del modelo de datos, prioridades y reglas de negocio para asistentes de IA.

---

## 6. Informes de Aseguramiento de Calidad y Seguridad (`qa/`)

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
* **[MODULO_TUTORIALES_QA_CHECKLIST.md](./qa/MODULO_TUTORIALES_QA_CHECKLIST.md)**: Checklist de QA del módulo Tutoriales (roles, filtros, media, seguridad).
