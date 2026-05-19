do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'players'
      and policyname = 'Public read players in public active leagues'
  ) then
    create policy "Public read players in public active leagues"
    on public.players
    for select
    to anon
    using (
      exists (
        select 1
        from public.leagues l
        where l.id = players.league_id
          and l.is_public = true
          and l.status = 'active'
      )
    );
  end if;
end $$;
