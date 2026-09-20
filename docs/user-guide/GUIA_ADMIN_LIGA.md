# Guía para administradores de liga (`league_admin`)

Como administrador de liga tienes el control operativo completo de tu competencia: desde la creación de la liga hasta el cierre de temporada. Esta guía recorre todos los módulos en el orden natural de operación.

> Los *super administradores* de la plataforma también pueden realizar todas estas acciones en cualquier liga.

---

## 1. Crear tu liga

1. En el panel, entra a **Ligas** → **Nueva liga**.
2. Captura nombre, región/ciudad y datos de identidad.
3. La liga se crea con estado `draft` (borrador). **No es visible al público** hasta que la actives y marques como pública.

### Publicar tu liga

Cuando estés lista para el mundo:

* Activa el estado `active` y habilita la visibilidad pública.
* Al ser activa y pública, tu liga aparece en **Explorar** y obtiene su portal `/liga/tu-liga` con tabla, calendario y estadísticas.

> La configuración del ciclo de vida avanzado (estado y visibilidad global) está descrita en la [guía de administración de plataforma](./GUIA_ADMIN_PLATAFORMA.md).

## 2. Administrar miembros y roles

En **Miembros** (`/dashboard/leagues/[slug]/members`):

* Ve la lista de personas con acceso a tu liga y su rol.
* Asigna o cambia roles: `league_admin`, `team_admin`, `coach`, `referee`, `viewer`.

Reglas de protección:

* No puedes dejar la liga **sin ningún administrador de liga**.
* El rol de super administrador de plataforma **no** se asigna desde aquí.
* Los árbitros deben ser miembros de la liga con rol `referee` (o administrador) para poder ser designados.

## 3. Temporadas

En **Temporadas** de tu liga:

1. Crea la temporada con nombre y periodo (ej. "Apertura 2026").
2. La tabla de posiciones se calcula **por temporada**.
3. Desde el detalle de temporada accedes a su tabla de posiciones y a la operación diaria.

## 4. Equipos y sedes

### Equipos
* Registra los clubes participantes (nombre, slug, estado).
* Los equipos pueden autoadministrarse: cada club con su `team_admin` gestiona datos, escudo, staff y plantilla (ver [guía de equipos](./GUIA_EQUIPOS.md)). Tú siempre conservas visión y control de toda la liga.

### Sedes (venues)
* Da de alta las canchas/estadios donde se jugará.
* Asigna la sede al crear cada partido.

## 5. Calendario de partidos

En **Partidos** de tu liga:

1. **Crea partidos**: equipos local y visitante, fecha/hora, sede y temporada.
2. **Edita la programación** cuando cambien fechas o sedes (los árbitros no pueden modificar la programación, solo tú).
3. **Asigna el cuerpo arbitral** desde el detalle de cada partido:
   * Árbitro central, primer asistente, segundo asistente y cuarto oficial.
   * Solo puedes designar personas miembros de la liga con rol `referee` o `league_admin`.
   * **Alerta de disponibilidad**: si un árbitro reportó indisponibilidad para esa fecha, verás una advertencia al designarlo.
   * La designación dispara una **notificación automática** al árbitro en su campana del panel.

## 6. Resultados y eventos

* Tú puedes **capturar y ajustar resultados** de cualquier partido de tu liga.
* Para partidos finalizados existe el **ajuste administrativo** de marcador/estado desde el detalle del partido (útil para correcciones o protestas).
* Los árbitros designados capturan el resultado y los eventos; los cuerpos técnicos registran eventos de sus propios equipos. Todos los cambios quedan auditados.

> Al quedar un partido en `completed`, la **tabla de posiciones se recalcula automáticamente**. También puedes forzar un **recálculo manual** desde la vista de standings de la temporada; el sistema te muestra advertencias si detecta inconsistencias (partidos omitidos) y guarda el historial de recálculos.

## 7. Tabla de posiciones

En **Posiciones** (por liga o por temporada):

* Consulta la tabla real calculada desde los resultados.
* Usa el **recálculo manual** tras correcciones administrativas.
* Revisa el **historial de recálculos** (últimos 10) con quién, cuándo y el resumen de filas procesadas.

## 8. Multimedia de la liga

En **Multimedia** (`/dashboard/leagues/[slug]/media`):

* **Galería**: sube fotografías de partidos y eventos (selección múltiple con recorte y compresión automática en tu dispositivo).
* **Filtros** por tipo: logos, jugadores, galería general.
* **Copia la URL pública** de cualquier recurso para usarlo donde necesites.
* **Elimina** archivos que ya no uses (borrado físico y en base de datos, con auditoría).
* **Limpieza de huérfanos**: herramienta para detectar y borrar archivos subidos hace más de 24 h sin referencia en la base de datos.

## 9. Auditoría de la liga

En **Auditoría** (`/dashboard/leagues/[slug]/audit`) tienes la trazabilidad completa:

* **Filtros** por acción, tipo de entidad, actor y rango de fechas; más **búsqueda por texto**.
* **Exportación a CSV** respetando los filtros activos.
* **Purga por retención**: elimina logs antiguos (90/180/365 días); la purga misma queda auditada.
* Se registran automáticamente cambios en partidos, eventos, designaciones arbitrales, staff de equipo e inscripciones de jugadores, además de las acciones desde la interfaz.

## 10. Notificaciones

* Tu liga se beneficia del centro de notificaciones in-app: los árbitros designados reciben avisos automáticos.
* Los **avisos globales a toda la plataforma** solo pueden enviarlos los super administradores de la plataforma.

---

## Flujo recomendado de temporada

```txt
1. Crear liga → 2. Invitar miembros y asignar roles → 3. Crear temporada
→ 4. Registrar equipos y sedes → 5. Programar jornadas → 6. Designar árbitros
→ 7. Jornada se juega: árbitro captura resultado y eventos
→ 8. Tabla se recalcula automáticamente → 9. Aficionados siguen todo en el portal público
→ 10. Fin de temporada: revisa auditoría y exporta la información que necesites
```

## Preguntas frecuentes

**¿Puedo transferir la administración de la liga?**
Sí, asigna el rol `league_admin` a otro miembro. El sistema nunca te dejará dejar la liga sin al menos un administrador.

**¿Qué pasa si capturo mal un resultado?**
Puedes ajustarlo desde el detalle del partido (partidos finalizados) o desde la captura de resultado. La tabla se recalcula automáticamente y todo queda en auditoría.

**¿Quién puede ver la auditoría?**
Solo los administradores de la liga y los super administradores de la plataforma.
