# Plan de Mejoras y Futuras Implementaciones

Documento vivo de evolución de FutPro Manager. Complementa el [Roadmap](./ROADMAP.md) (que describe lo ya construido por fase) con un backlog priorizado, criterios de aceptación y decisiones pendientes. Referencia cruzada: [Estado de implementación](./IMPLEMENTATION_STATUS.md).

---

## 0. Cómo leer este plan

* **Prioridad**: `P0` = crítico para operación real · `P1` = alto valor próximo · `P2` = diferenciador/mediano plazo · `P3` = exploratorio.
* **Esfuerzo**: `S` (días) · `M` (1–2 semanas) · `L` (3+ semanas).
* Cada iniciativa tiene criterios de aceptación verificables. Al completarse, moverla a [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) con evidencia en repo (regla de [RULES.md](../guidelines/RULES.md)).

---

## 1. Base para operación real (P0)

### 1.1 Pipeline event-driven de standings
**Contexto:** el recálculo automático hoy depende del flujo de guardado de resultados (server action). Existe auditoría completa, pero no un pipeline desacoplado.
**Mejora:** mover el recálculo a trigger SQL o job encolado al cambio de estado de partidos; reintentos con backoff; idempotencia por temporada.
**Criterios de aceptación:**
- [ ] Resultado capturado ⇒ standings consistentes sin depender del request HTTP.
- [ ] Reintento automático ante fallo, con registro `standings.recalculate_failed`.
- [ ] Paridad de resultados entre recálculo manual y automático (tests).

### 1.2 QA multi-cuenta y E2E
**Contexto:** los QA previos fueron por code review; falta validación real con varias sesiones simultáneas y navegador gráfico.
**Mejora:** suite E2E (Playwright) cubriendo los flujos críticos por rol; fixture de datos de prueba reproducible.
**Criterios de aceptación:**
- [ ] Escenarios E2E: árbitro captura resultado→tabla actualizada; team_admin gestiona staff (guardrail último admin); coach registra evento filtrado por equipo; permisos fail-closed por rol.
- [ ] Integrado a CI (GitHub Actions) con lint + tests + build.

### 1.3 Endurecimiento del onboarding de ligas
**Contexto:** crear una liga requiere coordinación manual (roles, miembros, árbitros).
**Mejora:** asistente de creación de liga (plantillas de roles, invitación por correo/enlace, checklist de puesta a punto).
**Criterios de aceptación:**
- [ ] Una liga nueva queda operativa (miembros + equipos + calendario base) en una sola sesión guiada.

### 1.4 Observabilidad básica
**Mejora:** logging estructurado de errores de server actions, monitoreo de latencia de consultas clave y alertas simples (email/Slack) para fallos de recálculo o auditoría.
**Criterios de aceptación:**
- [ ] Errores de server actions visibles en un canal de alertas.
- [ ] Dashboard simple de salud (build, DB, storage).

---

## 2. Producto para ligas (P1)

### 2.1 Suspensión automática por acumulación
La liga define umbrales (ej. 5 amarillas, 1 roja) y el sistema marca al jugador `suspended` al alcanzarlos, con aviso al cuerpo técnico. Hoy el estatus es manual.

### 2.2 Gestión de alineaciones previas
Captura de alineación titular/suplentes por partido (con validación de inscripción activa), alimentando la cédula oficial y stats de minutos jugados.

### 2.3 Fichas de juego y sanciones económicas
Registro de multas por tarjeta/expulsión con tarifa configurable por liga y reporte por club (frecuente en ligas amateur).

### 2.4 Reportes y exportaciones para directivos
PDF/hoja de cálculo de: tabla por jornada, goleo, disciplina, fair play y cédulas históricas. La auditoría ya exporta CSV; extender el patrón.

### 2.5 Historial histórico de temporadas
Vista de temporadas pasadas por liga (campeón, goleador, tablas archivadas) — alimenta el orgullo local del portal público.

### 2.6 Notificaciones ampliadas
Hoy: designaciones arbitrales + broadcast global. Agregar: recordatorio al árbitro 24 h antes, aviso a cuerpos técnicos al publicar resultado, aviso de cambio de fecha/sede.

---

## 3. Comunidad y crecimiento (P1–P2)

### 3.1 Compartir en redes sociales
Botones de compartir en partido/equipo/jugador usando las OpenGraph cards dinámicas ya existentes (generación en servidor lista; falta el CTA).

### 3.2 Seguimiento de aficionado (favoritos)
Sin login o con login ligero: marcar equipo/liga favorita y ver un feed "mi liga hoy". Requiere definir modelo de identidad anónima vs cuenta.

### 3.3 SEO y descubrimiento local
Sitemap, datos estructurados schema.org (SportsEvent/SportsTeam), landing por región (Perote y municipios vecinos) para captura orgánica.

### 3.4 PWA básica
Instalable en el celular del árbitro/administrador, con caché de lectura para consultar tabla y calendario con mala conexión (realidad rural).

---

## 4. Plataforma y operación comercial (P1–P2)

### 4.1 Pasarela de pagos (SaaS)
**Contexto:** el modelo actual es licenciamiento manual (super_admin asigna planes). Las tablas `subscription_plans`/`league_subscriptions` ya existen.
**Mejora:** integrar cobro (Stripe u otro), self-serve para liga nueva, webhook que sincronice estados `trialing/active/past_due/paused`, dunning básico.
**Decisión pendiente:** proveedor de pagos y modelo de pricing (ver sección 6).
**Criterios de aceptación:**
- [ ] Una liga puede suscribirse y pagar sin intervención manual.
- [ ] `league_subscriptions.status` refleja el estado real del cobro.
- [ ] Acceso a la liga se condiciona (o no) según política comercial definida.

### 4.2 Onboarding self-serve con trial
Registro de liga → trial de N días → conversión. Complementa 1.3 y 4.1.

### 4.3 Panel de métricas de negocio
Para super_admin: ligas activas, retención, partidos capturados por semana, adopción de módulos (media, stats, cédulas).

---

## 5. Técnico y seguridad (P1–P2)

### 5.1 Auditoría full-text y filtros a nivel BD
Índices `pg_trgm` para búsqueda textual en `audit_logs` (hoy la búsqueda es post-fetch). También: exportación PDF de reportes de auditoría.

### 5.2 Rate limiting y protección de abuso
Rate limit en server actions sensibles (login-adjacentes, formularios públicos de contacto) — el QA de seguridad previo ya identificó el tema.

### 5.3 Backups y recuperación
Verificar política de backups de Supabase (PITR), documentar procedimiento de restore y hacer un simulacro.

### 5.4 Performance de vistas públicas
Revisar consultas de stats agregadas con volúmenes reales (índices ya creados en migración `20260916030403`); medir y ajustar caching ISR.

### 5.5 Cobertura de tests
Los suites actuales cubren lógica de dominio (stats, playoffs, media, audit). Ampliar a helpers de permisos y utilidades de formularios críticos.

---

## 6. Decisiones abiertas (a definir con el producto)

| Decisión | Opciones | Impacto |
|---|---|---|
| Proveedor de pagos | Stripe / Lemon Squeezy / manual prolongado | 4.1, pricing, fiscal |
| Modelo de pricing | Gratis regional / freemium / suscripción por liga | 4.1, 4.2 |
| Identidad del aficionado | Anónimo / cuenta ligera / OAuth | 3.2 |
| Subdominios por liga | Sí (multi-tenant por dominio) / rutas actuales | branding, SEO, infra |
| Aplicación nativa vs PWA | PWA primero / apps nativas post-validación | 3.4, alcance móvil |

---

## 7. Fuera de alcance actual (explícito)

* Transmisión en vivo / video.
* Apuestas o pronósticos (riesgo regulatorio y de reputación).
* Marketplace de jugadores/pases federados.
* Multi-idioma (el mercado inicial es es-MX; arquitectura lista si cambia).

---

## 8. Sugerencia de secuencia (próximas 8 semanas)

```txt
Semanas 1–2:  1.2 QA E2E + CI  ·  1.4 observabilidad básica
Semanas 3–4:  1.1 pipeline standings  ·  5.3 backups/restore
Semanas 5–6:  2.1 suspensión automática  ·  3.1 compartir en redes
Semanas 7–8:  4.1 decisión+spike de pagos  ·  1.3 asistente de liga
```

La secuencia prioriza **confiabilidad primero** (E2E, observabilidad, standings, backups) y luego **valor de producto** (automatización de liga, viralidad, comercial).
