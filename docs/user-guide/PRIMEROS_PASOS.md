# Primeros pasos · FutPro Manager

Esta guía te acompaña desde que llegas a FutPro Manager hasta que tienes tu cuenta lista, conoces cómo instalar la app en tu celular y sabes qué puedes hacer según tu rol.

---

## 1. Crear tu cuenta

1. Entra a la plataforma y presiona **Crear cuenta** o **Iniciar sesión**.
2. En la pantalla de registro completa tus datos:
   - **Correo electrónico y contraseña**: el formulario incluye un **medidor de seguridad de contraseña** en tiempo real y confirmación de clave para evitar errores tipográficos.
   - **Selector de rol de interés**: selecciona cómo planeas usar la plataforma (`Aficionado`, `Jugador`, `Cuerpo técnico` o `Directivo / Árbitro`).
3. Al registrarte, el sistema crea automáticamente tu **perfil de usuario**.
4. Tu cuenta inicia como usuario de consulta (`viewer`). Para obtener un rol operativo (administrador de liga, de equipo, cuerpo técnico o árbitro), el **administrador de tu liga** debe agregarte como miembro y asignarte el rol correspondiente en la liga o club.

> 💡 **Nota sobre el super administrador:** El primer *super administrador* de la plataforma se asigna por SQL administrativo inicial en base de datos. Administradores posteriores pueden ser promovidos por un super administrador activo desde la consola de usuarios (`/dashboard/users`) mediante frase de confirmación obligatoria.

---

## 2. Iniciar sesión y cerrar sesión

1. Entra con tu correo y contraseña desde la pantalla de **Iniciar sesión** (`/login`).
2. Al iniciar sesión llegarás al **panel (dashboard)**, tu centro de operaciones.
3. Para salir, presiona tu avatar o nombre en el encabezado del panel y selecciona **Cerrar sesión**.

¿Olvidaste tu contraseña? Usa el enlace *"¿Olvidaste tu contraseña?"* en la pantalla de inicio de sesión; recibirás un correo electrónico seguro para restablecerla en `/update-password`.

---

## 3. Instalar la app en tu celular (PWA)

FutPro Manager es una **Progressive Web App (PWA)** instalable sin pasar por tiendas de aplicaciones:

* **En iPhone / iPad (Safari):**
  1. Abre FutPro Manager en Safari.
  2. Presiona el botón de **Compartir** (icono de cuadro con flecha hacia arriba).
  3. Desplázate y selecciona **Agregar a pantalla de inicio**.
  4. Presiona **Agregar**.
* **En Android (Chrome):**
  1. Abre FutPro Manager en Chrome.
  2. Toca el menú de tres puntos verticales o el banner inferior de instalación.
  3. Selecciona **Instalar aplicación** o **Agregar a pantalla principal**.

**Ventajas:**
- Se abre a pantalla completa sin la barra del navegador (experiencia como app nativa).
- Barra de navegación inferior (`BottomNav`) fija y accesible con una sola mano.
- Acceso ultra rápido al **Modo Cancha** para árbitros durante las jornadas de juego.

---

## 4. Configurar tu perfil

En **Perfil** (`/dashboard/profile`, disponible para todos los roles) puedes:

* **Subir tu foto de perfil / avatar**: selecciona una imagen, recórtala en formato cuadrado (1:1), ajusta el zoom o arrástrala y guarda. Si no tienes foto, se muestran tus iniciales.
* **Editar tus datos personales**: nombre para mostrar, nombre completo y teléfono de contacto.

Cada actualización de perfil queda auditada con trazabilidad en la plataforma.

---

## 5. Entender tu rol en la plataforma

FutPro Manager es **multi-liga**: una misma plataforma sirve a varias ligas y clubes, y tus permisos dependen de tu rol asignado:

| Rol | Alcance | Guía de referencia |
|---|---|---|
| `viewer` (consulta) | Modo lectura de las ligas y equipos autorizados. | — |
| `coach` (cuerpo técnico) | Operación deportiva de sus equipos (jugadores, dorsales, eventos). | [Guía de equipos](./GUIA_EQUIPOS.md) |
| `team_admin` (administrador de equipo) | Administración institucional y deportiva de su club (escudo, staff, plantilla). | [Guía de equipos](./GUIA_EQUIPOS.md) |
| `referee` (árbitro) | Actas de partidos designados, marcadores, eventos de cancha y cédula. | [Guía de arbitraje](./GUIA_ARBITRAJE.md) |
| `league_admin` (administrador de liga) | Gestión integral de su liga (temporadas, clubes, calendario, árbitros, auditoría). | [Guía de administrador de liga](./GUIA_ADMIN_LIGA.md) |
| `super_admin` (super administrador) | Administración global transversal: usuarios, storage, avisos masivos y ligas. | [Guía de administración de plataforma](./GUIA_ADMIN_PLATAFORMA.md) |

> **Los controles se adaptan a tu rol:** Si no cuentas con permisos para una acción (ej. editar marcadores o borrar clubes), la interfaz oculta los botones de forma preventiva. La seguridad final está validada en el servidor y la base de datos (RLS).

---

## 6. Recorrer el panel (dashboard)

Al iniciar sesión verás:

* **Métricas principales**: ligas activas, equipos registrados, jugadores y próximos partidos.
* **Tendencias y analítica**: goles por jornada, balance de disciplina (amarillas y rojas), avance del torneo y gráfica interactiva SVG.
* **Próximos partidos** y **actividad reciente de auditoría** (según tus permisos).
* **Navegación adaptativa:**
  - En computadora: barra lateral completa (`Sidebar`) con accesos organizados.
  - En celular: barra inferior fija (`BottomNav`) con 4 accesos rápidos según tu rol y menú drawer *"Más"* para módulos complementarios.
* **Campana de notificaciones** en el encabezado: avisos automáticos de designaciones arbitrales y comunicados globales de la plataforma.

---

## 7. Explorar ligas públicas

No necesitas una cuenta para seguir el fútbol amateur local: entra a **Explorar** desde la portada para descubrir ligas activas, ver tablas de posiciones con rachas de forma, revisar estadísticas de goleo y seguir el calendario de juegos. Consulta la [guía del portal público](./PORTAL_PUBLICO.md).
