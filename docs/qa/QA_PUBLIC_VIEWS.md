# QA Final — Plan UX/UI y Conversión Pública

Fecha: 2026-05-19  
Estado: **Listo para revisión manual**

---

## Checklist automatizado

| Verificación | Resultado |
|---|---|
| `npm run lint` | ✅ Sin errores |
| `npm run build` | ✅ Compilación exitosa |
| Links a `/dashboard` en vistas públicas | ✅ No encontrados |
| Texto "MVP" en landing pública | ✅ Eliminado en rama Fase 1 |

---

## Ramas por revisar

| Fase | Rama | PR |
|---|---|---|
| 1 — CTAs conversión | `feat/fase-1-ctas-conversion` | Pendiente merge |
| 2 — Landing visual | `feat/fase-2-landing-visual` | Pendiente merge |
| 3 — Nav + Breadcrumbs + Teams | `feat/fase-3-nav-breadcrumbs-teams` | Pendiente merge |
| 4 — Player detail | `feat/fase-4-player-detail` | Pendiente merge |
| 5 — SEO / OpenGraph | `feat/fase-5-seo-opengraph` | Pendiente merge |

---

## Checklist de QA manual (ejecutar con `npm run dev`)

### Rutas a validar

- [ ] `/` — Landing: CTAs ordenados (Crear cuenta primario), sin texto MVP, mockups visibles
- [ ] `/login` — Abre modo "Iniciar sesión" por defecto
- [ ] `/login?mode=register` — Abre modo "Registrarme" directamente
- [ ] `/liga/liga-municipal-perote` — Carga sin sesión, breadcrumb visible
- [ ] `/liga/liga-municipal-perote/teams` — Listado de equipos públicos, tab "Equipos" activo
- [ ] `/liga/liga-municipal-perote/teams/[teamSlug]` — Breadcrumb: Liga → Equipos → Nombre
- [ ] `/liga/liga-municipal-perote/matches` — Lista de partidos
- [ ] `/liga/liga-municipal-perote/matches/[matchId]` — Breadcrumb: Liga → Partidos → Local vs Visitante
- [ ] `/liga/liga-municipal-perote/players/[playerId]` — Estados humanizados, links a equipo/partido, breadcrumb

### Responsive

- [ ] Mobile (≤640px): CTAs apilados sin overflow, breadcrumbs sin corte, tabla legible
- [ ] Tablet (768px): grid 2 columnas en beneficios/mockups
- [ ] Desktop (1280px): grid 3 columnas completo

### Accesibilidad básica

- [ ] Tab navigation funciona en CTAs del hero
- [ ] Tab navigation funciona en tabs de PublicNav
- [ ] Tab navigation funciona en breadcrumbs
- [ ] `nav aria-label="Breadcrumb"` presente en DevTools
- [ ] Contraste de texto pasa AA en CTAs principales

### Estados vacíos

- [ ] Liga sin equipos → EmptyState en `/teams`
- [ ] Jugador sin registros → EmptyState en historial
- [ ] Jugador sin eventos → EmptyState en eventos

### SEO

- [ ] `<meta property="og:image">` apunta a `/og/futpro-manager.png`
- [ ] `<meta property="og:site_name">` = "FutPro Manager"
- [ ] `<title>` correcto en cada página pública

---

## Pendientes post-merge

- Reemplazar `/og/futpro-manager.png` con imagen de 1200×630px para mejor ratio OG
- Agregar `NEXT_PUBLIC_SITE_URL` en variables de entorno de Vercel
- OG dinámico por liga/partido (mejora futura, no bloqueante)
