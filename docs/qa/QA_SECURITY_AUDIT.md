# Informe de Auditoría de Seguridad y Mitigaciones · FutPro Manager

**Fecha:** 2026-09-16  
**Entorno:** Producción / Staging / Desarrollo Local  
**Objetivo:** Identificación y mitigación integral de vulnerabilidades críticas, intermedias y operativas en capa de base de datos (PostgreSQL/Supabase RLS), almacenamiento (Storage), capa de aplicación (Next.js Server Actions) y autenticación.

---

## 1. Resumen Ejecutivo de Hallazgos

| Nivel | Hallazgo | Estado | Mitigación |
| :--- | :--- | :--- | :--- |
| **HIGH** | 1. Storage `league-media`: UPDATE/DELETE abierto a cualquier usuario autenticado | ✅ Corregido | Migración `20260917000000_storage_media_hardening.sql` con helper `is_league_media_manager` |
| **HIGH** | 2. Stored XSS vía SVG como logo y ausencia de Content Security Policy (CSP) | ✅ Corregido | Validación de *magic bytes* de imagen, exclusión de SVG y cabeceras CSP completas en `next.config.js` |
| **HIGH** | 3. Stored `javascript:` en `logo_url` al crear o editar equipos | ✅ Corregido | Validación de esquemas `http:`/`https:` en acciones y neutralización a `<span>` en `ExternalTextLink` |
| **HIGH** | 4. Bypass de elegibilidad de jugadores y amaño/downgrade de resultados completados | ✅ Corregido | Verificación server-side de elegibilidad y bloqueo de alteración de partidos `completed` o `cancelled` |
| **MEDIUM** | 1. Inserción de `audit_logs` forjable por cualquier viewer o usuario sin liga | ✅ Corregido | Migración `20260917010000_restrict_audit_logs_policy.sql` restringida a administradores y árbitros |
| **MEDIUM** | 2. Inyección de filtro `.or()` mediante `teamId` en listado de partidos | ✅ Corregido | Validación estricta con formato UUID y existencia en la lista oficial de equipos de la liga |
| **MEDIUM** | 3. Flujo de recuperación de contraseña débil y enumeración de correos | ✅ Corregido | Mensajes neutrales en signup/forgot password y validación de sesión/código PKCE en `update-password` |
| **MEDIUM** | 4. Ausencia de limitador de tasa (rate limit) en formulario de contacto anónimo | ✅ Corregido | Limitador de tasa en memoria por IP (`lib/rate-limit.ts`) aplicado a `submitContactAction` |
| **LOW/INFO** | 1. Cuatro acciones de creación dependían exclusivamente de RLS sin app-layer check | ✅ Corregido | Chequeo explícito de `canManageLeague` en creación de equipos, sedes, temporadas y partidos |
| **LOW/INFO** | 2. `team_admin` podía agregar a cualquier usuario ajeno a la liga al staff | ✅ Corregido | Verificación en `addTeamMemberAction` de pertenencia previa a `league_members` |
| **LOW/INFO** | 3. Doble vía de actualización de resultados con lógica de autorización divergente | ✅ Corregido | Unificación de validaciones y de `canOfficiateMatch(..., matchId)` en ambas acciones |

---

## 2. Detalle Técnico de Mitigaciones

### 2.1. Almacenamiento y Archivos (Storage)
* **Vulnerabilidad:** La política en `20260916081652_media_enhancements.sql` validaba `name like 'leagues/%'`, permitiendo que cualquier usuario con token válido modificara o eliminara imágenes de otras ligas.
* **Corrección:** Se implementó la función SQL `public.is_league_media_manager(object_name text)` que extrae de forma segura el UUID de la liga de la ruta del bucket (`leagues/<uuid>/...`) y comprueba `public.can_manage_league(league_uuid)`. Las políticas de `UPDATE` y `DELETE` ahora exigen ser propietario del objeto, superadministrador o manager verificado.
* **Prevención de XSS:** Se eliminó la extensión y MIME `image/svg+xml` para logos, permitiendo exclusivamente formatos rasterizados (`JPEG`, `PNG`, `WebP`). La subida analiza el buffer binario comprobando firmas de cabecera (*magic bytes*) reales antes de enviar a Storage.

### 2.2. Cabeceras HTTP y Content Security Policy (CSP)
* **Vulnerabilidad:** El servidor servía páginas sin cabeceras de protección, permitiendo framing y sin restricciones de inyección de scripts externos.
* **Corrección:** Se configuró en `next.config.js`:
  * `Content-Security-Policy`: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; object-src 'none'; frame-ancestors 'none';`
  * `X-Frame-Options: DENY`
  * `X-Content-Type-Options: nosniff`
  * `Referrer-Policy: strict-origin-when-cross-origin`
  * `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  * `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

### 2.3. Integridad Competitiva (Elegibilidad y Resultados)
* **Vulnerabilidad:** La UI ocultaba jugadores no elegibles, pero la Server Action `createMatchEventAction` no verificaba el estado disciplinario, permitiendo inyectar eventos de jugadores suspendidos, lesionados o con doble amonestación / roja.
* **Corrección:**
  * Invocación obligatoria de `checkPlayerEligibility` en servidor evaluando partidos y tarjetas de la temporada.
  * Protección contra modificación de resultados: un partido con estado `completed` o `cancelled` rechaza actualizaciones o borrado de eventos por parte de árbitros o staff; solo un administrador de liga puede reabrirlo o corregirlo.

### 2.4. Protección de Logs de Auditoría
* **Vulnerabilidad:** La política permitía inserción a cualquier usuario con `can_access_league` (incluyendo `viewer`) y a cualquier usuario autenticado si `league_id` era nulo.
* **Corrección:** Política `audit_logs_insert_privileged` que exige que el actor tenga rol directivo (`can_manage_league`), rol arbitral (`referee`) o rol de administrador de equipo (`team_admin`). Los usuarios con rol `viewer` o sin membresía no pueden insertar registros.

### 2.5. Prevención de Ataques de Inyección y PostgREST
* **Vulnerabilidad:** El parámetro `teamId` de la URL se concatenaba directamente en la cláusula `.or()` de Supabase.
* **Corrección:** Validación de formato canónico UUID (RFC 4122) y confirmación de pertenencia al array de equipos de la liga. Si el valor es inválido o no existe, se descarta limpiamente.

### 2.6. Privacidad y Prevención de Enumeración
* **Vulnerabilidad:** Respuestas diferenciadas en inicio/recuperación revelaban si un correo electrónico estaba registrado.
* **Corrección:** Mensajes estandarizados y neutros para solicitudes de recuperación y registro existente.
* **Saneamiento de Repositorio:** Desindexación de semillas de prueba locales con contraseñas temporales (`seed_test_users_by_role.sql`), exclusión de archivos `.env*` y carpetas de configuración de agentes en `.gitignore`.

---

## 3. Verificación y Resultados de Pruebas

* **Vitest:** 12 suites ejecutadas, 80/80 tests pasados.
* **TypeScript Compiler (`tsc --noEmit`):** 0 errores de tipado en código y acciones.
* **Linter (`eslint`):** 0 errores bloqueantes.
* **Compilación Next.js Turbopack (`npm run build`):** Compilación 100% exitosa con generación de 124 rutas estáticas y dinámicas.
