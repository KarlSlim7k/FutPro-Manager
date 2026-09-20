# Guía de equipos: administrador y cuerpo técnico (`team_admin` y `coach`)

Esta guía cubre la operación de un club. Hay dos niveles:

| Rol | Enfoque | Puede | No puede |
|---|---|---|---|
| **Administrador de equipo** (`team_admin`) | Institucional | Datos y escudo del club, staff, plantilla, jugadores, eventos de sus partidos | Administrar la liga, programar partidos, capturar marcador final |
| **Cuerpo técnico / entrenador** (`coach`) | Deportivo | Jugadores, plantilla, dorsales, eventos de sus partidos | Editar datos o escudo del club, administrar staff, capturar marcador |

Ambos comparten el **Hub "Mis equipos"** en el panel: accesos directos al detalle del club, su plantilla y su staff, con insignias que indican tu rol en cada club.

---

## 1. Datos e identidad del club (`team_admin`)

* **Editar el equipo** (`/teams/[teamSlug]/edit`): nombre, identificador y estado.
* **Escudo/logotipo**: sube o actualiza la imagen del club. El sistema te permite **recortarla en formato cuadrado**, ajustar zoom y posición antes de guardar; se optimiza automáticamente.

> El escudo se muestra en el portal público: tabla de posiciones, calendario y perfil del club.

## 2. Cuerpo técnico / staff (`team_admin`)

En **Staff** (`/teams/[teamSlug]/staff`):

* **Agregar integrantes** desde los usuarios que ya son miembros de la liga, con rol de `team_admin` o `coach`.
* **Cambiar roles** dentro del staff.
* **Remover integrantes** que salen del club.

Protección incorporada: el sistema **nunca dejará al club sin su último administrador de equipo**.

> Si eres `coach`, esta página se muestra en modo consulta: puedes ver quién integra el cuerpo técnico, pero no modificarlo.

## 3. Plantilla por temporada (roster)

En **Plantilla** (`/teams/[teamSlug]/roster`), tanto `team_admin` como `coach`:

1. **Inscribir jugadores** de la liga a la plantilla de la temporada activa.
2. **Asignar y cambiar el dorsal** de cada jugador.
3. **Actualizar el estatus** de cada registro:
   * `active` — jugando de forma regular.
   * `inactive` — temporalmente inactivo pero sigue en el club.
   * `suspended` — suspendido (ej. por disciplina).
   * `transferred` — transferido a otro club.
4. **Dar de baja** a un jugador de la plantilla cuando corresponda.

Cada movimiento de plantilla queda registrado en la auditoría de la liga.

## 4. Jugadores

Disponible para `team_admin` y `coach`:

* **Alta de jugadores** en la liga: datos deportivos y personales permitidos.
* **Edición** de la ficha del jugador.
* **Foto del jugador**: súbelas con recorte en formato retrato (3:4) para las fichas del portal público.

> La ficha pública del jugador (visible en ligas públicas) muestra su foto, datos deportivos y estadísticas de temporada.

## 5. Eventos de partido

En el **detalle del partido** → **Eventos** (`/matches/[matchId]/events`):

* El formulario te muestra **solo tu club** en el selector de equipo (no puedes registrar eventos del rival).
* Registra durante o después del partido:
  * ⚽ **Gol** (y **asistencia** del jugador que asistió).
  * 🥅 **Autogol**.
  * 🟨 **Tarjeta amarilla** y 🟥 **Tarjeta roja**.
  * 🔄 **Sustitución**.
  * 🎯 **Penal** (anotado o atajado).
* En cada evento captura el **minuto** y notas si aplica.
* Puedes **eliminar eventos** con confirmación (queda auditado).

**Importante:** el **marcador final** lo capturan el árbitro designado o el administrador de la liga. Tú registras los eventos deportivos; el resultado técnico es responsabilidad arbitral/administrativa.

## 6. Seguimiento desde el panel

* **Widget "Mis equipos"** en el inicio del dashboard: salto directo a tus clubes.
* En **Equipos** (`/dashboard/teams`) verás todos tus clubes con insignia de rol (`Administrador de equipo` o `Cuerpo técnico`) y accesos a Detalle, Plantilla y Staff.
* En el **calendario de la liga** puedes seguir los partidos de tu club, con marcadores y estados al día.

---

## Flujo típico de una jornada

```txt
Viernes:  Revisa la plantilla, confirma dorsales y estatus del semanario
Día del partido:  Registras goles, tarjetas y cambios desde /events
Después:  El árbitro oficializa el marcador → la tabla se actualiza sola
Sábado:   Comparte el portal público con tu afición (resultados, tabla y stats)
```

## Preguntas frecuentes

**Soy entrenador, ¿puedo poner el escudo nuevo del club?**
No. La identidad del club (datos y escudo) es responsabilidad del administrador del equipo. Solicítalo a tu `team_admin`.

**¿Puedo inscribir a un jugador que está en otro club?**
Las inscripciones operan por temporada y estatus. Si el jugador pertenece a la liga, puedes inscribirlo en tu plantilla; el sistema registra el movimiento para trazabilidad.

**¿Por qué no puedo cambiar el marcador?**
Por diseño: la integridad del resultado es del árbitro designado o del administrador de liga. Si detectas un error, comuéntaselo a tu liga para que se ajuste con auditoría.
