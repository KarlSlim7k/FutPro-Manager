-- ============================================================
-- Módulo Tutoriales por Rol
-- Tablas: tutorials, tutorial_steps
-- RLS fail-closed: lectura autenticados (is_published=true),
-- escritura restringida a super_admin y league_admin.
-- ============================================================

create table if not exists public.tutorials (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) >= 3),
  summary text not null,
  target_roles text[] not null default '{viewer}',
  tags text[] not null default '{}',
  estimated_minutes int not null default 5 check (estimated_minutes > 0),
  sort_order int not null default 100,
  is_published boolean not null default true,
  related_route text null,
  faq jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tutorial_steps (
  id uuid primary key default gen_random_uuid(),
  tutorial_id uuid not null references public.tutorials (id) on delete cascade,
  step_order int not null check (step_order >= 0),
  title text not null check (char_length(title) >= 2),
  body_md text not null,
  media_path text null,
  media_type text null check (media_type is null or media_type in ('gif', 'video', 'image')),
  faq jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tutorial_steps_tutorial_order_unique unique (tutorial_id, step_order)
);

-- Índices de búsqueda y filtrado
create index if not exists idx_tutorials_roles on public.tutorials using gin (target_roles);
create index if not exists idx_tutorials_tags on public.tutorials using gin (tags);
create index if not exists idx_tutorials_published_sort on public.tutorials (is_published, sort_order);
create index if not exists idx_tutorial_steps_tutorial_order on public.tutorial_steps (tutorial_id, step_order);

-- Triggers de actualización automática de timestamps
drop trigger if exists on_tutorials_set_updated_at on public.tutorials;
create trigger on_tutorials_set_updated_at
  before update on public.tutorials
  for each row execute function public.set_updated_at();

drop trigger if exists on_tutorial_steps_set_updated_at on public.tutorial_steps;
create trigger on_tutorial_steps_set_updated_at
  before update on public.tutorial_steps
  for each row execute function public.set_updated_at();

-- Habilitar RLS (fail-closed)
alter table public.tutorials enable row level security;
alter table public.tutorial_steps enable row level security;

-- ------------------------------------------------------------
-- Políticas RLS: tutorials
-- ------------------------------------------------------------

-- SELECT: usuarios autenticados pueden ver publicados; admins pueden ver todos (incluso borradores para editar)
drop policy if exists "tutorials_select_authenticated" on public.tutorials;
create policy "tutorials_select_authenticated"
  on public.tutorials for select
  to authenticated
  using (
    is_published = true
    or public.is_super_admin()
    or exists (
      select 1 from public.league_members lm
      where lm.profile_id = auth.uid() and lm.role = 'league_admin'
    )
  );

-- INSERT: solo super_admin o league_admin
drop policy if exists "tutorials_insert_admin" on public.tutorials;
create policy "tutorials_insert_admin"
  on public.tutorials for insert
  to authenticated
  with check (
    public.is_super_admin()
    or exists (
      select 1 from public.league_members lm
      where lm.profile_id = auth.uid() and lm.role = 'league_admin'
    )
  );

-- UPDATE: solo super_admin o league_admin
drop policy if exists "tutorials_update_admin" on public.tutorials;
create policy "tutorials_update_admin"
  on public.tutorials for update
  to authenticated
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.league_members lm
      where lm.profile_id = auth.uid() and lm.role = 'league_admin'
    )
  )
  with check (
    public.is_super_admin()
    or exists (
      select 1 from public.league_members lm
      where lm.profile_id = auth.uid() and lm.role = 'league_admin'
    )
  );

-- DELETE: solo super_admin o league_admin
drop policy if exists "tutorials_delete_admin" on public.tutorials;
create policy "tutorials_delete_admin"
  on public.tutorials for delete
  to authenticated
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.league_members lm
      where lm.profile_id = auth.uid() and lm.role = 'league_admin'
    )
  );

-- ------------------------------------------------------------
-- Políticas RLS: tutorial_steps
-- ------------------------------------------------------------

-- SELECT: visible si el tutorial padre es visible para el usuario autenticado
drop policy if exists "tutorial_steps_select_authenticated" on public.tutorial_steps;
create policy "tutorial_steps_select_authenticated"
  on public.tutorial_steps for select
  to authenticated
  using (
    exists (
      select 1 from public.tutorials t
      where t.id = tutorial_steps.tutorial_id
        and (
          t.is_published = true
          or public.is_super_admin()
          or exists (
            select 1 from public.league_members lm
            where lm.profile_id = auth.uid() and lm.role = 'league_admin'
          )
        )
    )
  );

-- INSERT: solo super_admin o league_admin
drop policy if exists "tutorial_steps_insert_admin" on public.tutorial_steps;
create policy "tutorial_steps_insert_admin"
  on public.tutorial_steps for insert
  to authenticated
  with check (
    public.is_super_admin()
    or exists (
      select 1 from public.league_members lm
      where lm.profile_id = auth.uid() and lm.role = 'league_admin'
    )
  );

-- UPDATE: solo super_admin o league_admin
drop policy if exists "tutorial_steps_update_admin" on public.tutorial_steps;
create policy "tutorial_steps_update_admin"
  on public.tutorial_steps for update
  to authenticated
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.league_members lm
      where lm.profile_id = auth.uid() and lm.role = 'league_admin'
    )
  )
  with check (
    public.is_super_admin()
    or exists (
      select 1 from public.league_members lm
      where lm.profile_id = auth.uid() and lm.role = 'league_admin'
    )
  );

-- DELETE: solo super_admin o league_admin
drop policy if exists "tutorial_steps_delete_admin" on public.tutorial_steps;
create policy "tutorial_steps_delete_admin"
  on public.tutorial_steps for delete
  to authenticated
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.league_members lm
      where lm.profile_id = auth.uid() and lm.role = 'league_admin'
    )
  );

-- ------------------------------------------------------------
-- Storage: permitir subida bajo tutorials/% en bucket league-media
-- ------------------------------------------------------------
drop policy if exists "Tutorials media insert restricted" on storage.objects;
create policy "Tutorials media insert restricted"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'league-media'
    and name like 'tutorials/%'
    and (
      public.is_super_admin()
      or exists (
        select 1 from public.league_members lm
        where lm.profile_id = auth.uid() and lm.role = 'league_admin'
      )
    )
  );
