# Plan UX/UI y Conversión Pública FutPro Manager

## Diagnóstico Breve

- La landing actual está en `app/page.tsx`; ya tiene hero, CTAs y una card de “Plataforma SaaS”, pero el CTA principal actual prioriza “Iniciar sesión”, “Crear cuenta” apunta a `/login` sin abrir registro y todavía aparece copy interno tipo “MVP”. La landing tiene **4 CTAs** activos: “Iniciar sesión”, “Crear cuenta”, un anchor interno `#sistema` (“Conocer el sistema”) y “Consultar Liga Municipal Perote”; el plan de cambio debe contemplar los 4.
- No existe ruta `/register`; el flujo real de registro está dentro de `components/auth/login-form.tsx` como modo interno `login/register`. `LoginForm` no acepta props; siempre arranca en modo `login`. `app/login/page.tsx` tampoco lee `searchParams`; ambos archivos deben modificarse para soportar `/login?mode=register`.
- Las vistas públicas bajo `/liga/[slug]` ya funcionan con Supabase/RLS y tienen metadata básica, pero OpenGraph/Twitter aún son mínimos y no hay imagen OG ni `metadataBase`.
- Las páginas públicas de detalle de partido, equipo y jugador no tienen breadcrumbs. El detalle de jugador es el punto más débil visualmente: JSX comprimido, estados crudos, poca jerarquía y links incompletos.
- No existe `app/liga/[slug]/teams/page.tsx` (el directorio `app/liga/[slug]/teams/` sí existe con su subruta `[teamSlug]`); los equipos son descubribles desde standings o partidos, pero no desde una lista pública dedicada. Solo se necesita crear el archivo `page.tsx`, no el directorio.

## Fase 1: Quick Wins de Conversión y Copy

**Objetivo**

Alinear la landing con conversión SaaS: una acción principal clara, registro directo y copy comercial sin lenguaje interno.

**Archivos probables**

- `app/page.tsx`
- `app/login/page.tsx`
- `components/auth/login-form.tsx`

**Cambios concretos**

- Cambiar el orden de CTAs del hero:
  - Primario: `Crear cuenta` → `/login?mode=register`
  - Secundario: `Ver liga demo` → `/liga/liga-municipal-perote` (renombra el CTA actual “Consultar Liga Municipal Perote”)
  - Link menor: `Iniciar sesión` → `/login`
  - Anchor `Conocer el sistema` → eliminar o convertir en link menor de texto; no es CTA de conversión
- Hacer que `LoginForm` acepte un `initialMode` y que `app/login/page.tsx` lea `searchParams.mode`.
- Mantener `/login` como login por defecto; usar `/login?mode=register` para abrir registro sin crear una ruta nueva.
- Reemplazar el texto “MVP enfocado…” por copy comercial, por ejemplo: “Diseñado para reducir trabajo administrativo, publicar información clara y mantener a equipos y jugadores al día.”
- Renombrar CTA “Consultar Liga Municipal Perote” a “Ver liga demo” para que funcione como prueba social/demo.
- Mantener `focus-visible`, contraste y botones apilados en mobile.

**Riesgos**

- Si `searchParams` se parsea mal, `/login` podría abrir registro accidentalmente.
- Si se cambia demasiado el hero en esta fase, puede mezclarse con la fase visual.

**Criterios de aceptación**

- `/login` abre modo “Iniciar sesión”.
- `/login?mode=register` abre modo “Registrarme”.
- El CTA principal de landing abre directamente registro.
- No queda “MVP” visible en la landing pública.
- Hero mobile muestra CTAs sin overflow ni jerarquía confusa.

**Comandos de validación**

- `npm run lint`
- `npm run build`

## Fase 2: Estructura Visual de Landing

**Objetivo**

Convertir la landing en una página comercial más convincente sin tocar backend ni auth.

**Archivos probables**

- `app/page.tsx`
- Opcional: reutilizar `components/ui/card.tsx`, `components/ui/eyebrow.tsx`, `components/ui/status-badge.tsx`

**Cambios concretos**

- Agregar sección visual de producto después del hero con tres mockups/cards:
  - Panel administrativo: métricas, próximos partidos, acciones de gestión.
  - Tabla pública: posiciones, puntos, diferencia de goles.
  - Detalle de partido: marcador, eventos, estado del partido.
- Construir los mockups con HTML/Tailwind y componentes existentes, sin nuevas dependencias ni datos reales.
- Agregar sección de beneficios por usuario:
  - Administradores de liga: menos hojas de cálculo, control centralizado, publicación rápida.
  - Equipos: calendario, plantilla, resultados y tabla en un solo lugar.
  - Jugadores/aficionados: consulta pública de partidos, equipos, jugadores y eventos.
- Mantener composición SaaS funcional: secciones escaneables, no hero marketing excesivo, no cards anidadas.
- Usar una paleta más equilibrada que no dependa solo de emerald: grises, blanco, emerald como acento, y algún azul/amber mínimo para distinguir estados.

**Riesgos**

- Sobrecargar la landing con demasiadas cards.
- Crear mockups que parezcan datos reales si no están claramente presentados como preview de producto.
- Degradar mobile si los mockups no tienen constraints estables.

**Criterios de aceptación**

- La landing comunica beneficios antes de detalles técnicos.
- Las tres superficies de producto son visibles y legibles en mobile y desktop.
- No se agregan dependencias.
- No se consultan datos ni se cambia lógica de negocio.
- No hay texto solapado ni botones con labels cortados.

**Comandos de validación**

- `npm run lint`
- `npm run build`

## Fase 3: Navegación Pública, Breadcrumbs y Ruta de Equipos

**Objetivo**

Mejorar orientación y descubribilidad en vistas públicas.

**Archivos probables**

- `components/public/public-nav.tsx`
- Nuevo componente justificado: `components/public/public-breadcrumbs.tsx`
- `app/liga/[slug]/matches/[matchId]/page.tsx`
- `app/liga/[slug]/teams/[teamSlug]/page.tsx`
- `app/liga/[slug]/players/[playerId]/page.tsx`
- Nuevo archivo (directorio ya existe): `app/liga/[slug]/teams/page.tsx`

**Cambios concretos**

- Crear `PublicBreadcrumbs` porque se reutilizará en al menos partido, equipo, jugador y lista de equipos.
- Breadcrumbs:
  - Partido: Liga → Partidos → `Local vs Visitante`
  - Equipo: Liga → Equipos → `Nombre del equipo`
  - Jugador: Liga → Jugador → `Nombre del jugador`
- Agregar tab “Equipos” a `PublicNav`.
- Crear `/liga/[slug]/teams`:
  - Lista equipos públicos de la liga activa.
  - Usa query existente de `teams` bajo RLS pública.
  - Cards inline con `Card`, `StatusBadge`, `TextLink`; no reutilizar `TeamCard` porque enlaza a dashboard privado.
  - Cada card enlaza a `/liga/[slug]/teams/[teamSlug]`.
- Impacto de ruta:
  - Navegación: agrega una entrada estable para descubrir equipos.
  - SEO: permite indexar listado público de equipos por liga.
  - Compatibilidad: no rompe rutas existentes; solo añade una ruta nueva y links internos.

**Riesgos**

- El tab “Equipos” debe marcarse activo para `/teams` y `/teams/[teamSlug]` sin activar “Resumen”.
- Evitar links privados del dashboard en vistas públicas.
- Si una liga no tiene equipos, debe mostrar `EmptyState`.

**Criterios de aceptación**

- Las páginas de partido, equipo y jugador muestran breadcrumbs accesibles con `nav aria-label`.
- `/liga/[slug]/teams` carga sin sesión y respeta liga pública/activa.
- La navegación pública incluye “Equipos”.
- No se introducen cambios de RLS ni migraciones.

**Comandos de validación**

- `npm run lint`
- `npm run build`

## Fase 4: Detalle Público de Jugador

**Objetivo**

Pulir la ficha pública del jugador para que sea clara, escaneable y consistente.

**Archivos probables**

- `app/liga/[slug]/players/[playerId]/page.tsx`
- Reutilizar `components/ui/status-badge.tsx`, `components/ui/empty-state.tsx`, `components/ui/text-link.tsx`

**Cambios concretos**

- Reestructurar el JSX del detalle de jugador en bloques legibles.
- Agregar mapas humanos de estado:
  - Player: `active` Activo, `inactive` Inactivo, `injured` Lesionado, `suspended` Suspendido, `retired` Retirado.
  - Registro: `active` Activo, `inactive` Inactivo, `released` Liberado, `transferred` Transferido.
  - Eventos: usar labels ya existentes o equivalentes humanos.
- Usar `StatusBadge` para estado del jugador y estado de registros.
- Mejorar separación visual:
  - Card de perfil con foto, estado, posición.
  - Card de registros con filas/cards.
  - Card de eventos recientes con links.
- En registros, enlazar equipo cuando exista `team.slug`:
  - `/liga/${league.slug}/teams/${team.slug}`
- En eventos, enlazar partido cuando aplique:
  - `/liga/${league.slug}/matches/${event.match_id}`
- Mantener empty states actuales, pero con copy más claro.

**Riesgos**

- Los eventos actualmente no cargan datos del partido, solo `match_id`; el link puede construirse sin nueva query.
- No asumir que `teamsMap` o `seasonsMap` siempre tiene datos; mantener fallback “No disponible”.
- Evitar cambiar qué registros o eventos son visibles; solo presentación.

**Criterios de aceptación**

- No se muestran estados crudos como `active` o `yellow_card` al usuario final.
- La ficha es legible en mobile.
- Los links a equipo y partido funcionan cuando hay datos.
- Sigue retornando `notFound()` para jugador inexistente o liga no pública.

**Comandos de validación**

- `npm run lint`
- `npm run build`

## Fase 5: SEO y Social Previews

**Objetivo**

Hacer metadata coherente y compartible sin introducir complejidad dinámica innecesaria.

**Archivos probables**

- `app/layout.tsx`
- `app/page.tsx`
- `app/liga/[slug]/page.tsx`
- `app/liga/[slug]/standings/page.tsx`
- `app/liga/[slug]/matches/page.tsx`
- `app/liga/[slug]/matches/[matchId]/page.tsx`
- `app/liga/[slug]/teams/page.tsx`
- `app/liga/[slug]/teams/[teamSlug]/page.tsx`
- `app/liga/[slug]/players/[playerId]/page.tsx`
- Nuevo asset: `public/og/futpro-manager.png`

**Cambios concretos**

- Agregar `metadataBase` en `app/layout.tsx`, usando `NEXT_PUBLIC_SITE_URL` con fallback local.
- Agregar metadata completa para landing:
  - title, description, alternates canonical, OpenGraph, Twitter.
- Estandarizar public pages:
  - `siteName: "FutPro Manager"`
  - `locale: "es_MX"`
  - `type`: `website` para landing/listados/liga, `article` para partido, `profile` para jugador.
  - `images`: usar `/og/futpro-manager.png` como fallback fijo.
- Mantener metadata dinámica por entidad usando consultas existentes.
- No implementar OG dinámico en esta ronda: viable técnicamente con rutas `opengraph-image.tsx`, pero no conviene mezclarlo con UX porque añade superficie de render, caching y datos remotos.
- Dejar issue posterior para OG dinámico por liga/partido si se quiere personalización avanzada.

**Riesgos**

- Sin `NEXT_PUBLIC_SITE_URL`, URLs absolutas pueden depender del fallback local.
- Crear un asset OG exige revisar peso, dimensiones y contraste.
- Metadata dinámica debe manejar `not found` sin filtrar datos privados.

**Criterios de aceptación**

- Landing y páginas públicas tienen title/description coherentes.
- Social previews usan imagen fija.
- Build no falla por metadata inválida.
- No se agregan dependencias ni rutas dinámicas OG complejas.

**Comandos de validación**

- `npm run lint`
- `npm run build`

## Fase 6: QA Final

**Objetivo**

Validar conversión, navegación pública, responsive, accesibilidad básica y build.

**Archivos probables**

- Sin cambios de producto obligatorios.
- Opcional documentación: `docs/QA_PUBLIC_VIEWS.md` o nuevo registro QA si se desea documentar evidencia.

**Cambios concretos**

- Validar manualmente:
  - `/`
  - `/login`
  - `/login?mode=register`
  - `/liga/liga-municipal-perote`
  - `/liga/liga-municipal-perote/teams`
  - `/liga/liga-municipal-perote/teams/[teamSlug]`
  - `/liga/liga-municipal-perote/matches`
  - `/liga/liga-municipal-perote/matches/[matchId]`
  - `/liga/liga-municipal-perote/players/[playerId]`
- Revisar responsive en mobile, tablet y desktop.
- Revisar navegación por teclado en CTAs, tabs, breadcrumbs y filtros.
- Revisar que no aparezcan links a dashboard en páginas públicas.
- Revisar estados vacíos: sin equipos, sin registros, sin eventos, sin temporadas.
- Ejecutar validación final.

**Riesgos**

- QA visual real puede quedar limitado si no se levanta navegador.
- La liga demo depende de que existan datos en Supabase.

**Criterios de aceptación**

- No hay regresiones en landing, auth ni vistas públicas.
- No hay errores de lint/build.
- CTAs, breadcrumbs y nav son accesibles por teclado.
- No hay cambios de backend, migraciones ni lógica de negocio innecesaria.

**Comandos de validación**

- `npm run lint`
- `npm run build`
- Opcional: `npm run dev` para QA manual local

## Issues Técnicos Priorizados

1. **P0 - CTA de registro directo y copy comercial**
   - Implementar `/login?mode=register`, reordenar CTAs y eliminar “MVP” de la landing.

2. **P1 - Landing con secciones de producto y beneficios**
   - Agregar mockups de panel, tabla pública y detalle de partido; agregar beneficios por tipo de usuario.

3. **P1 - Breadcrumbs públicos reutilizables**
   - Crear `PublicBreadcrumbs` y usarlo en detalle de partido, equipo y jugador.

4. **P1 - Ruta pública `/liga/[slug]/teams`**
   - Crear listado público de equipos, agregar tab “Equipos” y enlazar a detalles públicos.

5. **P1 - Pulido de detalle público de jugador**
   - Humanizar estados, usar `StatusBadge`, mejorar layout y agregar links a equipo/partido.

6. **P2 - Metadata/OpenGraph consistente**
   - Agregar `metadataBase`, canonical, OG/Twitter completos e imagen OG fija.

7. **P2 - QA responsive/accesibilidad pública**
   - Validar rutas públicas, CTAs, breadcrumbs, navegación por teclado, lint y build.

## Supuestos y Defaults

- Se usará `/login?mode=register` en vez de crear `/register`, porque reutiliza el flujo existente y evita una ruta adicional.
- La liga demo por defecto será `/liga/liga-municipal-perote`, ya referenciada en la landing actual.
- `/liga/[slug]/teams` sí conviene crearla por descubribilidad, SEO y consistencia de navegación.
- No habrá cambios de Supabase, RLS, migraciones ni lógica de negocio.
- No se agregarán dependencias nuevas.
- La primera versión de OG usará imagen fija; OG dinámico queda como mejora posterior.
