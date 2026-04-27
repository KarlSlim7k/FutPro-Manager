# INFRASTRUCTURE

## Stack

- Vercel (Frontend + API)
- Supabase (DB + Auth + Storage)
- GitHub (repo)

## Environment Variables

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

## Auth Flow (MVP)

- `/login`: acceso y registro de usuarios con Supabase Auth.
- `/dashboard`: ruta protegida para usuarios autenticados.
- `middleware.ts`: refresca sesión y aplica redirecciones:
  - no autenticado en `/dashboard` -> `/login`
  - autenticado en `/login` -> `/dashboard`

## Deployment

- Automatic via GitHub -> Vercel

## Notes

- No exponer `SUPABASE_SERVICE_ROLE_KEY` en frontend.
- Usar plan free mientras sea posible.
- Escalar solo cuando haya usuarios activos.
