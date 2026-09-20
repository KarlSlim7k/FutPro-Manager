# AI CONTEXT · FutPro Manager

## Project

FutPro Manager

## Purpose

Sistema SaaS para gestión y seguimiento integral de ligas amateur de fútbol.

## Region

Perote, Veracruz, México.

## Core Concepts

- Liga (League)
- Temporada (Season)
- Equipo (Team)
- Jugador (Player)
- Partido (Match)
- Cuerpo arbitral (Match Officials / Referee)
- Evento de partido (Match Event)
- Tabla de posiciones (Standings)
- Notificaciones y avisos (User Notifications)
- Mensajes de contacto (Contact Messages)

## System Type

Multi-tenant (múltiples ligas aisladas en una sola plataforma web).

## Priorities

- Simplicidad y robustez
- Escalabilidad multi-liga
- Bajo costo operativo (Free-tier friendly)
- UX móvil prioritario (PWA, navegación por roles y Modo Cancha)
- Seguridad estricta (RLS fail-closed y auditoría automática)

## Backend & Data Layer

- Base de datos: Supabase PostgreSQL.
- Auth: Supabase Auth (`auth.users`).
- Migración inicial: `supabase/migrations/0001_initial_schema.sql`.
- RLS habilitado por tabla de negocio con helpers SQL reutilizables.
- Perfil se crea automáticamente al registrarse un usuario (`handle_new_auth_user`).
- El primer `super_admin` se asigna por SQL administrativo; administradores posteriores pueden asignarse desde la consola de usuarios con confirmación de seguridad.

## Domain Tables

- `profiles` (datos de usuario, rol global, avatar, estado `is_suspended`)
- `leagues` (organizaciones/ligas con slugs y visibilidad pública)
- `league_members` (membresías de usuario por liga: admin, árbitro, visor)
- `seasons` (temporadas por liga con fechas y estados)
- `teams` (clubes por liga con logos y slugs)
- `team_members` (staff de club: `team_admin` institucional y `coach` deportivo)
- `players` (fichas de futbolistas con fotos optimizadas)
- `player_team_registrations` (inscripciones activas por temporada y dorsal)
- `venues` (sedes y canchas de juego)
- `matches` (programación, marcadores, estado y árbitro principal)
- `match_officials` (terna arbitral completa: central, asistentes y 4to oficial)
- `referee_availabilities` (bloqueos de indisponibilidad arbitral)
- `match_events` (goles, tarjetas, autogoles, sustituciones, penales)
- `standings` (puntos, DG, racha W/D/L calculados con hardening)
- `media_uploads` (metadatos de archivos en Supabase Storage `league-media`)
- `audit_logs` (trazabilidad de acciones de usuario y triggers SQL)
- `subscription_plans` (planes comerciales para ligas)
- `league_subscriptions` (asignación y estado de suscripción por liga)
- `user_notifications` (avisos automáticos in-app y broadcast)
- `contact_messages` (mensajes recibidos del formulario público de contacto)

## Access Model Summary

- **Rol global:** `profiles.global_role` (`super_admin`, `viewer`).
- **Roles por liga:** `league_members.role` (`league_admin`, `referee`, `viewer`).
- **Roles por equipo:** `team_members.role` (`team_admin`, `coach`).
- **Datos públicos:** ligas/temporadas/equipos/sedes/partidos/eventos/standings/estadísticas cuando la liga está activa y pública.
- **Datos privados:** perfiles, membresías, media privada, auditoría y suscripciones.

## Fuentes de verdad de documentación

- Índice central: [`docs/README.md`](../README.md)
- Catálogo de prompts y agentes: [`docs/prompts/README.md`](./README.md)
- Estado del producto: [`docs/planning/IMPLEMENTATION_STATUS.md`](../planning/IMPLEMENTATION_STATUS.md)
- Hoja de ruta estratégica: [`docs/planning/ROADMAP.md`](../planning/ROADMAP.md)
- Plan de mejoras: [`docs/planning/IMPROVEMENT_PLAN.md`](../planning/IMPROVEMENT_PLAN.md)
- Plan UX/UI: [`docs/planning/PLAN_UX_UI.md`](../planning/PLAN_UX_UI.md)
- Reglas de codificación: [`docs/guidelines/RULES.md`](../guidelines/RULES.md)
- Arquitectura técnica: [`docs/architecture/ARCHITECTURE.md`](../architecture/ARCHITECTURE.md)
- Esquema de base de datos: [`docs/architecture/DATABASE.md`](../architecture/DATABASE.md)
- Onboarding para desarrolladores: [`docs/developer/DEVELOPER_GUIDE.md`](../developer/DEVELOPER_GUIDE.md)
- Guías de usuario final: [`docs/user-guide/README.md`](../user-guide/README.md)

## Notes for AI Agents

- Primero inspeccionar rutas/componentes/lógica real antes de concluir estado funcional.
- No asumir que un módulo está implementado solo porque existe en schema.
- Verificar evidencia en `app/`, `components/`, `actions` y consultas Supabase.
- Evitar overengineering.
- Priorizar MVP funcional y seguro.
- No romper flujo de auth existente.
- Mantener políticas RLS claras y auditables.
- Validar siempre con `npm test`, `npm run lint` y `npm run build`.
