-- Migration: Playoffs, series and brackets support
do $$
begin
  if not exists (select 1 from pg_type where typname = 'match_stage') then
    create type public.match_stage as enum (
      'regular_season',
      'round_of_16',
      'quarter_finals',
      'semi_finals',
      'third_place',
      'final'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'match_leg') then
    create type public.match_leg as enum (
      'single',
      'first_leg',
      'second_leg'
    );
  end if;
end $$;

alter table public.matches
  add column if not exists stage public.match_stage not null default 'regular_season',
  add column if not exists leg public.match_leg not null default 'single',
  add column if not exists series_id text,
  add column if not exists home_penalty_score int check (home_penalty_score >= 0),
  add column if not exists away_penalty_score int check (away_penalty_score >= 0);

create index if not exists idx_matches_stage on public.matches (season_id, stage);
create index if not exists idx_matches_series_id on public.matches (series_id);
