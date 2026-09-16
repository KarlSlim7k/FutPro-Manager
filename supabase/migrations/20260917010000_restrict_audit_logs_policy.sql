-- Migración: Restringir inserción en audit_logs (fix MEDIUM-1)
-- Reemplaza política laxa "audit_logs_insert_actor" que permitía a viewers o a cualquier
-- usuario (cuando league_id es nulo) forjar registros de auditoría arbitrarios.

drop policy if exists "audit_logs_insert_actor" on public.audit_logs;
drop policy if exists "audit_logs_insert_privileged" on public.audit_logs;

create policy "audit_logs_insert_privileged"
on public.audit_logs
for insert
to authenticated
with check (
  actor_id = auth.uid()
  and (
    public.is_super_admin()
    or (
      league_id is not null
      and (
        public.can_manage_league(league_id)
        or public.has_league_role(league_id, array['referee']::public.app_role[])
        or public.has_league_team_role(league_id, array['team_admin']::public.app_role[])
      )
    )
  )
);
