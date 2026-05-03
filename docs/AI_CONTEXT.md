# AI CONTEXT

## Project

FutPro Manager

## Purpose

Sistema SaaS para gestión de ligas amateur de fútbol.

## Region

Perote, Veracruz, México.

## Core Concepts

- Liga
- Temporada
- Equipo
- Jugador
- Partido
- Evento de partido
- Tabla de posiciones

## System Type

Multi-tenant (multi-liga en una sola app).

## Priorities

- Simplicidad
- Escalabilidad
- Bajo costo
- UX móvil

## Current Backend Data Layer

- Base de datos: Supabase PostgreSQL.
- Auth: Supabase Auth (`auth.users`).
- Migración inicial: `supabase/migrations/0001_initial_schema.sql`.
- RLS habilitado por tabla de negocio.
- Perfil se crea automáticamente al registrarse un usuario.
- Backfill de `profiles` incluido para usuarios auth preexistentes.

## Domain Tables (MVP)

- profiles
- leagues
- league_members
- seasons
- teams
- team_members
- players
- player_team_registrations
- venues
- matches
- match_events
- standings
- media_uploads
- audit_logs
- subscription_plans
- league_subscriptions

## Access Model Summary

- Rol global en `profiles.global_role`.
- Roles por liga en `league_members.role`.
- Roles por equipo en `team_members.role`.
- Datos públicos: ligas/temporadas/equipos/sedes/partidos/eventos/standings cuando la liga está activa y pública.
- Datos privados: perfiles, membresías, media, auditoría y suscripciones.

## Fuentes de verdad de documentación

- Estado del producto: `docs/IMPLEMENTATION_STATUS.md`.
- Reglas operativas y de agentes: `docs/RULES.md`.
- Arquitectura técnica: `docs/ARCHITECTURE.md`.

## Notes for AI Agents

- Primero inspeccionar rutas/componentes/lógica real antes de concluir estado funcional.
- No asumir que un módulo está implementado solo porque existe en schema.
- Verificar evidencia en `app/`, `components/`, `actions` y consultas Supabase.
- Evitar overengineering.
- Priorizar MVP funcional y seguro.
- No romper flujo de auth existente.
- Mantener políticas RLS claras y auditables.
- El primer `super_admin` se asigna manualmente por SQL administrativo seguro.
