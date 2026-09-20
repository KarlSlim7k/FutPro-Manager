# Guía para árbitros (`referee`)

Como árbitro oficial tienes el control del **acta arbitral** de tus partidos designados: marcador, eventos y cédula oficial. La plataforma te protege: nadie más puede alterar tu captura, y tú no puedes alterar la programación ni la administración de los clubes.

---

## 1. Tus designaciones

* **Hub "Mis partidos asignados"** en el panel (`/dashboard/matches`): lista de encuentros donde tienes designación, con estado, sede, fecha, marcador actual y accesos directos a **Detalle**, **Resultado**, **Eventos** y **Cédula**.
* **Widget en el inicio del dashboard** para saltar directo a tus próximos encuentros.
* En el **calendario de la liga**, activa el filtro *"Solo mis partidos asignados"*; tus tarjetas muestran la insignia **"Mi partido asignado"**.

### Cuerpo arbitral completo

Los partidos pueden tener terna completa:

| Posición | Descripción |
|---|---|
| **Árbitro central** | Responsable principal del encuentro. |
| **Primer asistente** | Juez de línea 1. |
| **Segundo asistente** | Juez de línea 2. |
| **Cuarto oficial** | Control de banquillos y suplencias. |

Cualquiera de las cuatro posiciones puede capturar resultado y eventos del partido (permiso validado en servidor). En la tarjeta arbitral verás la indicación **"(Tú)"** en tu posición.

> Si un partido **no tiene árbitro designado**, cualquier árbitro miembro de la liga puede oficiarlo.

## 2. Notificaciones y disponibilidad

* **Campana de notificaciones**: al ser designado a un partido recibes un aviso automático con enlace directo al encuentro.
* **Calendario de disponibilidad**: en tu hub de partidos registra las fechas en que **no estás disponible** (con horario y notas). Los administradores verán una alerta si intentan designarte en esas fechas, y pueden remover tus registros de disponibilidad si cambia tu situación.

## 3. Capturar el resultado y Modo Cancha táctil

En **Resultado** (`/matches/[matchId]/result`):

1. **Modo Cancha táctil en celular:**
   - La pantalla cuenta con **steppers táctiles de incremento y decremento (`+` y `-`)** con objetivos táctiles amplios (>= 44px) para ajustar los goles del equipo local y visitante con un solo toque, sin necesidad de lidiar con el teclado del teléfono en pleno campo.
2. Captura o ajusta el marcador: goles local y visitante.
3. Define el estado del partido: `live` (en vivo) o `completed` (finalizado).
4. Guarda. Si el partido queda **finalizado**, la tabla de posiciones **se recalcula automáticamente**.

**Correcciones**: si ya capturaste y hay un error, puedes ajustar marcador y estado desde el detalle del partido mientras sea técnico procedente. El sistema solo permite a árbitros modificar **marcador y estado** — nunca programación, sede ni equipos — y todo queda auditado.

## 4. Registrar eventos

En **Eventos** (`/matches/[matchId]/events`):

* A diferencia de los cuerpos técnicos, tu selector de equipo muestra **ambos clubes participantes**: como árbitro oficializas las incidencias de todo el encuentro.
* **Botones rápidos táctiles:** interfaz pensada para el uso en la cancha, con botones amplios para registrar: ⚽ goles, 🥅 autogoles, 🟨 tarjetas amarillas, 🟥 tarjetas rojas, 🔄 sustituciones y 🎯 penales — con minuto reglamentario y notas.
* El sistema valida la integridad: el jugador del evento debe estar inscrito activamente con ese equipo en la temporada del partido, y el evento no puede atribuirse a un club que no participa.
* Puedes **eliminar eventos** erróneos con confirmación obligatoria.

## 5. Cédula oficial y visualización móvil

En **Cédula** (`/matches/[matchId]/cedula`) generas el documento formal del encuentro, listo para **imprimir o revisar en digital**:

* **Pestañas móviles (`MobileCedulaTabs`):** en celulares, la cédula se organiza en pestañas táctiles (`Resumen`, `Alineaciones`, `Eventos` y `Firmas`) para navegarla cómodamente en pantalla pequeña.
* Alineaciones completas por equipo con números de dorsal validados.
* Reporte cronológico de goles y desglose disciplinario (amonestaciones y expulsiones).
* Ficha técnica con el **cuerpo arbitral completo** (central, asistentes y cuarto oficial).
* Líneas de firma para árbitros y capitanes/delegados.

El botón **"Cédula"** está disponible en tus cards de partidos, en el detalle del encuentro y en tus hubs operativos.

> 📱 **Tip de operación en campo:** Instala la plataforma como **PWA** en la pantalla de inicio de tu celular (ver [Primeros Pasos](./PRIMEROS_PASOS.md)) para tener acceso instantáneo a pantalla completa en la cancha y usar la barra inferior de navegación rápida.

## 6. Lo que está bloqueado para ti (por diseño)

| Acción | ¿Puedes? |
|---|---|
| Capturar/ajustar marcador y estado de tus partidos | ✅ Sí |
| Registrar/eliminar eventos de ambos equipos | ✅ Sí |
| Emitir cédula oficial | ✅ Sí |
| Gestionar tu disponibilidad | ✅ Sí |
| Crear/editar/eliminar partidos o cambiar sedes | ❌ No (administrador de liga) |
| Designar árbitros | ❌ No (administrador de liga) |
| Editar clubes, plantillas o jugadores | ❌ No (staff del club) |
| Administrar miembros, auditoría o standings manuales | ❌ No |

---

## Flujo típico de una jornada

```txt
1. Llega la notificación de designación (o revísala en "Mis partidos asignados")
2. Si no puedes asistir: registra tu indisponibilidad con anticipación
3. Día del partido: juega el encuentro
4. Captura el marcador y ponlo en vivo (badge EN VIVO para la afición)
5. Registra eventos: goles, tarjetas, cambios
6. Finaliza el partido (completed) → la tabla se recalcula sola
7. Emite la cédula oficial y consigue las firmas
```

## Preguntas frecuentes

**Me designaron a un partido pero no soy el central, ¿puedo capturar eventos?**
Sí. Las cuatro posiciones del cuerpo arbitral (central, asistentes y cuarto oficial) tienen facultad de captura sobre el acta del encuentro.

**El administrador puso mal la hora y no pude asistir, ¿qué hago?**
La programación es responsabilidad del administrador de liga. Registra la incidencia con él; tu disponibilidad en la plataforma ayuda a prevenir futuras colisiones.

**¿Puedo corregir un evento que capturé mal?**
Sí: elimina el evento erróneo y captura el correcto. Ambas operaciones quedan en el registro de auditoría de la liga.
