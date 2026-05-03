# Development Rules

## Principios

- MVP funcional antes que overengineering.
- Seguridad y RLS primero.
- Cambios pequeños y revisables.
- No mezclar cambios visuales con cambios de backend si no es necesario.
- Documentar cambios relevantes.

## Reglas de Supabase

- No modificar schema sin instrucción explícita.
- No modificar RLS sin instrucción explícita.
- No ejecutar migraciones sin instrucción explícita.
- No usar `SUPABASE_SERVICE_ROLE_KEY` en frontend.
- No insertar/actualizar/borrar datos productivos sin instrucción explícita.
- Respetar RLS y probar con usuario autenticado.

## Reglas de frontend

- Usar componentes existentes antes de crear nuevos.
- Mantener mobile-first.
- Mantener `focus-visible`.
- Mantener contraste suficiente.
- Usar `PageHeader`, `SectionHeader`, `EmptyState`, `TextLink`, `StatusBadge`, etc. cuando aplique.
- No crear estilos one-off si ya existe patrón.

## Reglas de rutas

- Rutas bajo `/dashboard` deben asumir usuario autenticado.
- Rutas por liga deben validar acceso vía Supabase/RLS.
- Si una entidad no existe o no es accesible, usar `notFound()` cuando aplique.
- Redirigir a `/login` cuando no haya usuario.

## Reglas de documentación

- Actualizar `IMPLEMENTATION_STATUS.md` cuando se agregue o cambie un módulo.
- Actualizar `DATABASE.md` solo si cambia el modelo de datos.
- Actualizar `DESIGN.md` si se agrega un patrón UI reutilizable.
- Actualizar `ROADMAP.md` cuando cambien fases o prioridades.
- No marcar algo como implementado sin evidencia en rutas/componentes/lógica real.

## Reglas para agentes IA / Codex

- Primero inspeccionar archivos reales.
- No confiar solo en documentación existente si puede estar desactualizada.
- Hacer cambios mínimos.
- Reportar archivos modificados.
- Reportar validaciones ejecutadas.
- No afirmar que algo fue probado si no se ejecutó.
