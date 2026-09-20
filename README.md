# FutPro Manager

**FutPro Manager** es una plataforma SaaS para la administración, gestión y control de ligas de fútbol amateur, iniciando en la zona regional de **Perote, Veracruz, México**.

El objetivo es digitalizar la operación de ligas locales: equipos, jugadores, temporadas, partidos, resultados, posiciones, estadísticas y contenido público para aficionados.

---

## Highlights del sistema

- Gestión multi-liga desde una sola aplicación.
- Administración de temporadas, torneos y jornadas.
- Registro y control de equipos.
- Registro de jugadores y plantillas.
- Programación de partidos próximos.
- Captura de resultados y eventos del partido.
- Tabla de posiciones automática.
- Roles para administración del sistema, ligas, equipos, entrenadores, árbitros y consulta pública.
- Optimizado para uso móvil.
- Preparado para iniciar gratis y evolucionar a modelo SaaS por suscripción.

---

## Alcance inicial

- Región objetivo: **Perote, Veracruz, México**.
- Modelo inicial: gratuito durante lanzamiento y pruebas.
- Modelo futuro: suscripción por liga.
- Arquitectura inicial: una sola app regional, sin subdominios por liga en la primera etapa.

Ejemplo de rutas futuras:

```txt
/liga/liga-municipal-perote
/liga/torneo-zona-norte
/equipo/club-ejemplo
/partido/temporada-2026-jornada-1
```

---

## Stack recomendado

- **Frontend:** Next.js, TypeScript, Tailwind CSS.
- **UI:** shadcn/ui.
- **Backend:** Next.js API Routes / Server Actions.
- **Base de datos:** Supabase PostgreSQL.
- **Auth:** Supabase Auth.
- **Storage:** Supabase Storage.
- **Deploy:** Vercel.
- **Repositorio:** GitHub.

---

## Documentación del proyecto

Toda la documentación técnica, manuales de arquitectura y reportes de aseguramiento de calidad están organizados en el directorio [`docs/`](./docs):

👉 **[Centro de Documentación Técnica (docs/README.md)](./docs/README.md)**

### Estructura documental:

0. **Para usuarios finales** (`docs/user-guide/`):
   - [`docs/user-guide/README.md`](./docs/user-guide/README.md) — Guías de uso por rol, glosario y portal público.
   - [`docs/user-guide/PRIMEROS_PASOS.md`](./docs/user-guide/PRIMEROS_PASOS.md) — Registro, perfil y primeros pasos.
   - [`docs/user-guide/GUIA_ADMIN_LIGA.md`](./docs/user-guide/GUIA_ADMIN_LIGA.md) — Operación de liga.
   - [`docs/user-guide/GUIA_EQUIPOS.md`](./docs/user-guide/GUIA_EQUIPOS.md), [`GUIA_ARBITRAJE.md`](./docs/user-guide/GUIA_ARBITRAJE.md) y [`GUIA_ADMIN_PLATAFORMA.md`](./docs/user-guide/GUIA_ADMIN_PLATAFORMA.md) — Guías por rol.

0b. **Para desarrolladores** (`docs/developer/`):
   - [`docs/developer/DEVELOPER_GUIDE.md`](./docs/developer/DEVELOPER_GUIDE.md) — Onboarding técnico: setup, estructura, patrones y calidad.

1. **Arquitectura, Datos e Infraestructura** (`docs/architecture/`):
   - [`docs/architecture/ARCHITECTURE.md`](./docs/architecture/ARCHITECTURE.md) — Arquitectura de capas, Server Components y Server Actions.
   - [`docs/architecture/DATABASE.md`](./docs/architecture/DATABASE.md) — Modelo entidad-relación y políticas de seguridad PostgreSQL.
   - [`docs/architecture/INFRASTRUCTURE.md`](./docs/architecture/INFRASTRUCTURE.md) — Infraestructura de Vercel + Supabase.
   - [`docs/architecture/ROLES_AND_PERMISSIONS.md`](./docs/architecture/ROLES_AND_PERMISSIONS.md) — Matriz RBAC completa del sistema.
   - [`docs/architecture/STORAGE_SETUP.md`](./docs/architecture/STORAGE_SETUP.md) — Configuración del bucket de medios `league-media`.

2. **Sistema de Diseño y Estándares** (`docs/guidelines/`):
   - [`docs/guidelines/DESIGN.md`](./docs/guidelines/DESIGN.md) — Sistema de diseño y lineamientos UX/UI.
   - [`docs/guidelines/RULES.md`](./docs/guidelines/RULES.md) — Reglas de codificación y estándares de calidad.

3. **Planificación y Producto** (`docs/planning/`):
   - [`docs/planning/IMPLEMENTATION_STATUS.md`](./docs/planning/IMPLEMENTATION_STATUS.md) — Estado real de módulos implementados.
   - [`docs/planning/ROADMAP.md`](./docs/planning/ROADMAP.md) — Hoja de ruta estratégica pre-MVP y post-MVP.
   - [`docs/planning/IMPROVEMENT_PLAN.md`](./docs/planning/IMPROVEMENT_PLAN.md) — Plan de mejoras y futuras implementaciones priorizado.
   - [`docs/planning/PLAN_UX_UI.md`](./docs/planning/PLAN_UX_UI.md) — Plan integral de experiencia de usuario e interfaz.

4. **Prompts y Asistencia de IA** (`docs/prompts/`):
   - [`docs/prompts/README.md`](./docs/prompts/README.md) — Catálogo de prompts, agentes e instrucciones de desarrollo.
   - [`docs/prompts/AI_CONTEXT.md`](./docs/prompts/AI_CONTEXT.md) — Resumen ejecutivo para contextos de desarrollo asistido por IA.

5. **Aseguramiento de Calidad y Seguridad (QA)** (`docs/qa/`):
   - [`docs/qa/QA_SECURITY_AUDIT.md`](./docs/qa/QA_SECURITY_AUDIT.md) — Auditoría de seguridad técnica y mitigaciones.
   - [`docs/qa/QA_RELEASE_CANDIDATE.md`](./docs/qa/QA_RELEASE_CANDIDATE.md) — Checklist consolidado pre-MVP.
   - Reportes especializados en [`docs/qa/`](./docs/qa) (*Audit Logs, Standings, Media, UI/UX, Permisos*).

---

## Inicio Rápido para Desarrollo

### Requisitos previos
- Node.js 18+ o superior
- Una instancia de Supabase (PostgreSQL + Auth + Storage)

### Pasos de instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/KarlSlim7k/FutPro-Manager.git
   cd FutPro-Manager
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env.local
   ```
   Edita `.env.local` con las credenciales de tu proyecto de Supabase (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

4. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

5. **Ejecución de pruebas y validación:**
   ```bash
   npm test       # Ejecuta la suite de pruebas unitarias con Vitest
   npm run build  # Compila y valida tipos TypeScript para producción
   ```

---

## Estado del proyecto

🚧 **Fase pre-MVP / Release Candidate.** Arquitectura base completada, seguridad endurecida y suite de pruebas unitarias al 100% pasando.

---

## Autor

Karol Delgado

