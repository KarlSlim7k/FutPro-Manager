-- Function to recalculate season standings natively in Postgres
create or replace function public.recalculate_season_standings(p_season_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_league_id uuid;
  v_updated_count int := 0;
begin
  -- Obtain league_id from season
  select league_id into v_league_id
  from public.seasons
  where id = p_season_id;

  if v_league_id is null then
    return jsonb_build_object('success', false, 'error', 'Season not found');
  end if;

  -- Upsert calculated stats from completed matches
  with season_teams as (
    select id as team_id
    from public.teams
    where league_id = v_league_id
      and status <> 'archived'
  ),
  match_records as (
    select
      home_team_id,
      away_team_id,
      home_score,
      away_score
    from public.matches
    where season_id = p_season_id
      and status = 'completed'
  ),
  team_stats as (
    select
      st.team_id,
      count(m.home_team_id) filter (where m.home_team_id = st.team_id or m.away_team_id = st.team_id) as played,
      count(*) filter (
        where (m.home_team_id = st.team_id and m.home_score > m.away_score)
           or (m.away_team_id = st.team_id and m.away_score > m.home_score)
      ) as won,
      count(*) filter (
        where (m.home_team_id = st.team_id or m.away_team_id = st.team_id)
          and m.home_score = m.away_score
      ) as drawn,
      count(*) filter (
        where (m.home_team_id = st.team_id and m.home_score < m.away_score)
           or (m.away_team_id = st.team_id and m.away_score < m.home_score)
      ) as lost,
      coalesce(sum(case when m.home_team_id = st.team_id then m.home_score when m.away_team_id = st.team_id then m.away_score else 0 end), 0) as goals_for,
      coalesce(sum(case when m.home_team_id = st.team_id then m.away_score when m.away_team_id = st.team_id then m.home_score else 0 end), 0) as goals_against
    from season_teams st
    left join match_records m on m.home_team_id = st.team_id or m.away_team_id = st.team_id
    group by st.team_id
  )
  insert into public.standings (
    league_id,
    season_id,
    team_id,
    played,
    won,
    drawn,
    lost,
    goals_for,
    goals_against,
    goal_difference,
    points,
    updated_at
  )
  select
    v_league_id,
    p_season_id,
    ts.team_id,
    ts.played,
    ts.won,
    ts.drawn,
    ts.lost,
    ts.goals_for,
    ts.goals_against,
    (ts.goals_for - ts.goals_against) as goal_difference,
    (ts.won * 3 + ts.drawn * 1) as points,
    now()
  from team_stats ts
  on conflict (season_id, team_id) do update set
    played = excluded.played,
    won = excluded.won,
    drawn = excluded.drawn,
    lost = excluded.lost,
    goals_for = excluded.goals_for,
    goals_against = excluded.goals_against,
    goal_difference = excluded.goal_difference,
    points = excluded.points,
    updated_at = now();

  get diagnostics v_updated_count = row_count;

  return jsonb_build_object(
    'success', true,
    'season_id', p_season_id,
    'rows_updated', v_updated_count
  );
end;
$$;

-- Trigger to recalculate standings whenever a match is completed or modified
create or replace function public.trigger_recalculate_standings_on_match_change()
returns trigger
language plpgsql
security definer
as $$
declare
  v_season_id uuid;
begin
  if tg_op = 'DELETE' then
    v_season_id := old.season_id;
  else
    v_season_id := new.season_id;
  end if;

  perform public.recalculate_season_standings(v_season_id);
  return null;
end;
$$;

drop trigger if exists trg_recalculate_standings on public.matches;
create trigger trg_recalculate_standings
after insert or update of status, home_score, away_score or delete on public.matches
for each row execute function public.trigger_recalculate_standings_on_match_change();
