# Guía para el administrador de la plataforma (`super_admin`)

El super administrador opera la **plataforma completa**, por encima de las ligas individuales: ciclo de vida de ligas, usuarios, almacenamiento, suscripciones, comunicados globales y auditoría global.

> Este rol solo se asigna por administración directa de la base de datos (nunca desde la interfaz), y es el único con acceso a las pantallas descritas aquí. Si otro usuario abre estas rutas, ve un aviso de acceso restringido.

---

## 1. Administración de ligas

En **Administración de ligas** (`/dashboard/leagues/admin`) tienes la vista global de **todas** las ligas de la plataforma:

* Listado con nombre, ubicación, estado y fecha de creación.
* **Control de ciclo de vida**: cambia el estado de cualquier liga (`draft`, `active`, `inactive`, `archived`).
* **Visibilidad pública**: activa o desactiva `is_public`. Solo las ligas activas y públicas aparecen en el portal público (Explorar y `/liga/[slug]`).

Úsalo para dar de alta ligas nuevas, retirar ligas abandonadas y moderar qué se publica.

## 2. Directorio de usuarios

En **Usuarios** (`/dashboard/users`):

* Busca y filtra usuarios registrados de toda la plataforma.
* Consulta el rol global y las insignias de cada usuario.
* **Controles de rol**: gestiona el rol global de los usuarios.
* **Suspensión**: suspende o reactiva cuentas cuando la política de la plataforma lo requiera.

## 3. Almacenamiento

En **Almacenamiento** (`/dashboard/storage`):

* **Resumen global**: uso total de archivos del bucket de medios, con desglose legible (KB/MB/GB).
* **Listado de objetos**: explora los archivos almacenados con filtros y paginación.
* **Gestión**: elimina archivos huérfanos o inapropiados a nivel de toda la plataforma (los administradores de liga gestionan solo los suyos desde su módulo de multimedia).

## 4. Mensajes de contacto

En **Mensajes de contacto** (`/dashboard/contact-messages`) está la bandeja del formulario público:

* **Métricas**: totales y recientes de solicitudes recibidas.
* **Bandeja**: nombre, correo, teléfono, liga de interés y mensaje, con fecha.
* **Retención**: política de purga de mensajes antiguos, con la operación auditada.

Es el canal de ventas/onboarding: ligas interesadas escriben aquí.

## 5. Suscripciones (licenciamiento)

En **Suscripciones** (`/dashboard/subscriptions`):

* **Planes**: crea, edita, activa y desactiva los planes de suscripción.
* **Asignación**: asigna un plan a una liga concreta con estados `trialing` (prueba), `active` (activa), `past_due` (pago vencido) y `paused` (pausada).

> Modelo actual: **licenciamiento manual** — no hay pasarela de cobro integrada todavía. La facturación se gestiona fuera de la plataforma; el módulo refleja el estado comercial de cada liga. Ver [plan de mejoras](../planning/IMPROVEMENT_PLAN.md).

## 6. Avisos globales

En **Avisos globales** (`/dashboard/notifications/broadcast`):

* Envía notificaciones in-app a **todos los usuarios** de la plataforma o **filtradas por rol** (ej. solo árbitros, solo administradores de liga).
* Útil para mantenimientos, anuncios de funcionalidades y comunicados operativos.

## 7. Auditoría global

En **Auditoría global** (`/dashboard/audit`):

* Vista consolidada de la actividad de **todas las ligas**.
* Mismos filtros que la auditoría por liga: acción, tipo de entidad, actor y fechas, más búsqueda textual.
* **Exportación CSV** global respetando filtros.
* Complemento de supervisión: revisa patrones anómalos, ajustes administrativos sensibles y purgas de logs.

## 8. Referencia de catálogos

En **Tipos y catálogos** (`/dashboard/types`) consulta los valores válidos del sistema: estados de liga/temporada/equipo/jugador/registro/partido, tipos de evento, roles, fases y formatos de liguilla. Es material de referencia: modificar catálogos requiere migración de base de datos.

---

## Responsabilidades y buenas prácticas

1. **Mínimo cambio posible**: los controles globales afectan a toda la plataforma; documenta cada intervención (la auditoría te respalda).
2. **Asignación de roles**: usa el directorio de usuarios con criterio; el escalamiento de privilegios está bloqueado por diseño desde la UI de ligas.
3. **Revisión periódica**: mensajes de contacto pendientes, ligas en borrador abandonadas, uso de almacenamiento y logs de auditoría.
4. **Suspensiones**: comunícalas por el canal de contacto del usuario antes o después, según la gravedad.
