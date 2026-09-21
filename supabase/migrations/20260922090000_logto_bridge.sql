-- Fase 2 Logto bridge: permitir perfiles sin auth.users (usuarios solo-Logto).
-- 1) Columnas de enlace.
alter table public.profiles
  add column if not exists logto_sub text unique,
  add column if not exists email text;

-- 2) Default uuid para perfiles creados fuera de Supabase Auth.
alter table public.profiles
  alter column id set default gen_random_uuid();

-- 3) Relajar FK profiles.id -> auth.users.id (bloqueaba inserts Logto).
--    Las filas existentes conservan sus ids; el cascade se pierde para
--    borrados futuros de auth.users (limpieza vía webhook/admin).
do $$
declare
  r record;
begin
  for r in (
    select c.conname
    from pg_constraint c
    join pg_class rel on rel.oid = c.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'profiles'
      and c.confrelid = 'auth.users'::regclass
  ) loop
    execute 'alter table public.profiles drop constraint ' || quote_ident(r.conname);
  end loop;
end
$$;

create index if not exists profiles_logto_sub_idx on public.profiles (logto_sub);
create index if not exists profiles_email_idx on public.profiles (email);
