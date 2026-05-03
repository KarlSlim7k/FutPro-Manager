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

La documentación técnica y de contexto para desarrollo se encuentra en la carpeta [`docs`](./docs):

- [`docs/AI_CONTEXT.md`](./docs/AI_CONTEXT.md) - contexto general para agentes de IA.
- [`docs/INFRASTRUCTURE.md`](./docs/INFRASTRUCTURE.md) - infraestructura, servicios y variables de entorno.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) - arquitectura de la aplicación.
- [`docs/DATABASE.md`](./docs/DATABASE.md) - modelo de base de datos inicial.
- [`docs/DESIGN.md`](./docs/DESIGN.md) - lineamientos de diseño y experiencia de usuario.
- [`docs/ROLES_AND_PERMISSIONS.md`](./docs/ROLES_AND_PERMISSIONS.md) - roles, permisos y alcance.
- [`docs/RULES.md`](./docs/RULES.md) - reglas de desarrollo y convenciones del proyecto.
- [`docs/ROADMAP.md`](./docs/ROADMAP.md) - roadmap de producto y UI/UX.
- [`docs/IMPLEMENTATION_STATUS.md`](./docs/IMPLEMENTATION_STATUS.md) - estado real de implementación por módulo.

**Nota:** Para conocer qué está implementado, qué está parcial y qué falta, revisar `docs/IMPLEMENTATION_STATUS.md`.

---

## Estado del proyecto

🚧 Proyecto en fase inicial / MVP.

---

## Autor

Karol Delgado
