# Guía de Usuario · FutPro Manager

Bienvenido a **FutPro Manager**, la plataforma para administrar y seguir ligas amateur de fútbol. Esta guía está escrita para **usuarios finales**: personas que administran ligas, clubes, plantillas, arbitran partidos o simplemente siguen el fútbol de su región.

> Si buscas documentación técnica (arquitectura, base de datos, despliegue), consulta el [Centro de Documentación Técnica](../README.md).

---

## ¿Qué puedes hacer con FutPro Manager?

| Perfil | Qué hace en la plataforma |
|---|---|
| **Aficionado / Visitante** | Sigue ligas, equipos, calendarios, resultados, tabla de posiciones y estadísticas desde el portal público, sin necesidad de cuenta. |
| **Administrador de liga** (`league_admin`) | Crea y administra su liga: temporadas, equipos, sedes, calendario, designaciones arbitrales, miembros y auditoría. |
| **Administrador de equipo** (`team_admin`) | Administra su club: datos y escudo, cuerpo técnico, plantilla por temporada y eventos de sus partidos. |
| **Entrenador / Cuerpo técnico** (`coach`) | Opera lo deportivo: jugadores, inscripciones, dorsales y eventos de los partidos de su club. |
| **Árbitro** (`referee`) | Captura marcadores y eventos en vivo con **Modo Cancha**, emite cédulas oficiales y gestiona su disponibilidad. |
| **Super administrador** (`super_admin`) | Consola global: administración de usuarios y roles, almacenamiento, avisos masivos, contacto, purgas y ciclo de vida de ligas. |

---

## Guías disponibles

### Para empezar
* **[Primeros pasos](./PRIMEROS_PASOS.md)**: crear tu cuenta con validaciones interactivas, instalar la app en el celular (PWA), configurar perfil y foto, y entender los roles.

### Para aficionados y público general
* **[Portal público](./PORTAL_PUBLICO.md)**: explorar ligas, ver tabla de posiciones, calendario, estadísticas avanzadas, equipos y jugadores — todo sin cuenta.

### Guías por rol
* **[Administrador de liga](./GUIA_ADMIN_LIGA.md)**: operación completa de una liga de principio a fin.
* **[Equipos: administrador y cuerpo técnico](./GUIA_EQUIPOS.md)**: gestión de club, staff, plantilla y eventos deportivos (`team_admin` y `coach`).
* **[Árbitros](./GUIA_ARBITRAJE.md)**: designaciones, captura táctil en Modo Cancha, eventos y cédula oficial (`referee`).
* **[Administrador de la plataforma](./GUIA_ADMIN_PLATAFORMA.md)**: consola global de super administración (`super_admin`).

---

## Glosario básico

| Término | Significado |
|---|---|
| **Liga** | Organización deportiva que agrupa temporadas y equipos. Cada liga tiene su propio portal público (`/liga/nombre-de-liga`). |
| **Temporada** | Periodo de competencia dentro de una liga (ej. "Apertura 2026"). La tabla de posiciones se calcula por temporada. |
| **Equipo (club)** | Plantel registrado en una liga, con escudo, staff y plantilla. |
| **Plantilla (roster)** | Lista de jugadores inscritos en un equipo para una temporada específica, con dorsal y estatus. |
| **Sede (venue)** | Cancha o estadio donde se juegan los partidos. |
| **Partido** | Encuentro entre dos equipos con fecha, sede, estado y árbitro(s) designado(s). |
| **Evento de partido** | Incidencia dentro del partido: gol, autogol, asistencia, tarjeta amarilla/roja, sustitución o penal. |
| **Tabla de posiciones (standings)** | Clasificación automática por temporada: puntos, goles, diferencia, rachas. |
| **Cédula oficial** | Documento formal del partido con alineaciones, goles, disciplinario y firmas, listo para imprimir. |
| **Modo Cancha** | Interfaz táctil adaptada para celulares con botones grandes y controles `+`/`-` para captura ágil en el campo de juego. |
| **PWA (Progressive Web App)** | Tecnología que permite instalar FutPro Manager en tu celular como si fuera una aplicación nativa. |
| **Auditoría** | Registro histórico de acciones importantes realizadas en la plataforma (quién, qué, cuándo). |
| **Notificaciones in-app** | Avisos que llegan a la campana del panel (ej. designación arbitral o avisos globales). |

---

## Estados más comunes que verás

| Estado | Dónde aparece | Significado |
|---|---|---|
| `draft` (borrador) | Ligas | En preparación, no visible al público. |
| `active` (activa) | Ligas y temporadas | En operación; si es pública, visible en el portal. |
| `scheduled` (programado) | Partidos | Pendiente de jugarse. |
| `live` (en vivo) | Partidos | En juego; el portal muestra la insignia **EN VIVO**. |
| `completed` (finalizado) | Partidos | Con resultado capturado; impacta la tabla. |
| `cancelled` / `postponed` | Partidos | Cancelado o pospuesto. |
| `active` / `inactive` / `suspended` / `transferred` | Registro de jugador | Situación del jugador en la plantilla. |

---

## ¿Necesitas ayuda?

* Para dudas sobre tu liga o equipo, contacta a tu **administrador de liga**.
* Para temas de la plataforma, usa el [formulario de contacto](https://futpromanager.com/contacto) público.
* Consulta los [términos](https://futpromanager.com/terminos) y el [aviso de privacidad](https://futpromanager.com/privacidad).
