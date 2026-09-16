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

1. **Arquitectura, Datos e Infraestructura:**
   - [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — Arquitectura de capas, Server Components y Server Actions.
   - [`docs/DATABASE.md`](./docs/DATABASE.md) — Modelo entidad-relación y políticas de seguridad PostgreSQL.
   - [`docs/INFRASTRUCTURE.md`](./docs/INFRASTRUCTURE.md) — Infraestructura de Vercel + Supabase.
   - [`docs/ROLES_AND_PERMISSIONS.md`](./docs/ROLES_AND_PERMISSIONS.md) — Matriz RBAC completa del sistema.
   - [`docs/STORAGE_SETUP.md`](./docs/STORAGE_SETUP.md) — Configuración del bucket de medios `league-media`.
   - [`docs/DESIGN.md`](./docs/DESIGN.md) & [`docs/RULES.md`](./docs/RULES.md) — Sistema de diseño y estándares de código.

2. **Planificación y Producto:**
   - [`docs/IMPLEMENTATION_STATUS.md`](./docs/IMPLEMENTATION_STATUS.md) — Estado real de módulos implementados.
   - [`docs/ROADMAP.md`](./docs/ROADMAP.md) — Hoja de ruta estratégica pre-MVP y post-MVP.
   - [`docs/PLAN_UX_UI.md`](./docs/PLAN_UX_UI.md) — Plan integral de experiencia de usuario e interfaz.
   - [`docs/AI_CONTEXT.md`](./docs/AI_CONTEXT.md) — Resumen ejecutivo para contextos de desarrollo asistido por IA.

3. **Aseguramiento de Calidad y Seguridad (QA):**
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

