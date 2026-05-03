# FutPro Manager Visual System (Pre-MVP)

## Propósito
Mantener una UI consistente, legible y escalable para el MVP sin introducir riesgo funcional.

## Principios UI
- Claridad primero: una acción principal visible por bloque.
- Consistencia: reutilizar componentes UI antes de crear estilos one-off.
- Accesibilidad básica: foco visible, contraste suficiente y jerarquía clara.
- Mobile-first: layouts legibles desde `sm` hacia arriba.

## Componentes base y uso
- `TextLink`: acciones de navegación secundaria en texto.
- `ExternalTextLink`: links externos (logo, foto, mapas) con foco consistente y apertura en nueva pestaña cuando aplica.
- `Eyebrow`: etiquetas cortas tipo contexto/metadata.
- `StatusBadge`: estados breves (`success`, `warning`, `danger`, `neutral`, `info`).
- `EmptyState`: bloques vacíos con título, descripción y acción opcional.
- `SectionHeader`: encabezado de sección interna (por defecto `h2`).
- `PageHeader`: encabezado principal de página (usa `h1`).
- `MetricCard`: métricas resumen.
- `FormSectionCard`: contenedor estándar para formularios en card.
- `ToolbarActions`: acciones agrupadas; apiladas en mobile, en fila en desktop.

## Reglas de accesibilidad visual
- `focus-visible` obligatorio en botones, links y controles interactivos.
- Mantener contraste alto en CTA y texto principal.
- Jerarquía de headings:
  - `h1`: título principal de página (`PageHeader`).
  - `h2`: secciones principales (`SectionHeader`).
  - `h3`: títulos de cards (`CardTitle`).
- Estados vacíos deben explicar qué falta y qué hacer después.
- Links externos deben ser consistentes y seguros (`rel="noreferrer"` cuando abren nueva pestaña).

## Reglas responsive
- Enfoque mobile-first.
- Acciones en stack para mobile (`ToolbarActions`).
- Grids progresivos (`sm`, `md`, `xl`) evitando compresión.
- Cards legibles en móvil: padding y separación balanceados.

## Restricciones de implementación UI
- No usar estilos one-off si ya existe un componente reutilizable.
- No crear componentes nuevos sin repetición clara (>= 3 usos).
- No cambiar lógica de negocio por motivos visuales.
- No mezclar cambios UI con cambios de backend/auth/permisos.

## Checklist final UI/UX pre-release
- [ ] Probar landing en mobile/tablet/desktop.
- [ ] Probar login/register.
- [ ] Probar dashboard vacío.
- [ ] Probar dashboard con datos.
- [ ] Probar listados con muchos elementos.
- [ ] Probar páginas de detalle.
- [ ] Probar formularios principales.
- [ ] Probar navegación por teclado.
- [ ] Revisar `focus-visible`.
- [ ] Revisar contraste visual.
- [ ] Revisar estados vacíos.
- [ ] Revisar estados edge (sin logo/foto/mapa, sin eventos, sin standings).
- [ ] Revisar errores de formulario.
- [ ] Revisar links externos.
- [ ] Ejecutar `npm run lint`.
- [ ] Ejecutar `npm run build`.
