-- =========================================================
-- 0003_standings_view.sql
-- =========================================================

create or replace view public.standings
with (security_invoker = true) as
with played_matches as (
  select *
  from public.matches
  where status = 'played'
),
-- "long format": uma linha por (time, partida), do ponto de vista desse time
team_matches as (
  select
    competition_id,
    home_team_id as team_id,
    home_score as goals_for,
    away_score as goals_against,
    match_date,
    round,
    case
      when home_score > away_score then 'V'
      when home_score = away_score then 'E'
      else 'D'
    end as result
  from played_matches

  union all

  select
    competition_id,
    away_team_id as team_id,
    away_score as goals_for,
    home_score as goals_against,
    match_date,
    round,
    case
      when away_score > home_score then 'V'
      when away_score = home_score then 'E'
      else 'D'
    end as result
  from played_matches
),
aggregated as (
  select
    ct.competition_id,
    ct.team_id,
    count(tm.team_id) as played,
    count(*) filter (where tm.result = 'V') as wins,
    count(*) filter (where tm.result = 'E') as draws,
    count(*) filter (where tm.result = 'D') as losses,
    coalesce(sum(tm.goals_for), 0) as goals_for,
    coalesce(sum(tm.goals_against), 0) as goals_against,
    coalesce(sum(tm.goals_for), 0) - coalesce(sum(tm.goals_against), 0) as goal_diff,
    (count(*) filter (where tm.result = 'V') * 3) + count(*) filter (where tm.result = 'E') as points
  from public.competition_teams ct
  left join team_matches tm
    on tm.competition_id = ct.competition_id and tm.team_id = ct.team_id
  group by ct.competition_id, ct.team_id
),
-- ultimos 5 resultados por time, mais recente primeiro
ranked_matches as (
  select
    competition_id,
    team_id,
    result,
    match_date,
    round,
    row_number() over (
      partition by competition_id, team_id
      order by match_date desc nulls last, round desc nulls last
    ) as rn
  from team_matches
),
last_five as (
  select
    competition_id,
    team_id,
    array_agg(result order by match_date asc nulls first, round asc nulls first) as last_five
  from ranked_matches
  where rn <= 5
  group by competition_id, team_id
)
select
  a.competition_id,
  a.team_id,
  t.name as team_name,
  t.crest_url,
  t.coach_name,
  a.played,
  a.wins,
  a.draws,
  a.losses,
  a.goals_for,
  a.goals_against,
  a.goal_diff,
  a.points,
  coalesce(lf.last_five, array[]::text[]) as last_five,
  row_number() over (
    partition by a.competition_id
    order by a.points desc, a.wins desc, a.goal_diff desc, a.goals_for desc, t.name asc
  ) as position
from aggregated a
join public.teams t on t.id = a.team_id
left join last_five lf on lf.competition_id = a.competition_id and lf.team_id = a.team_id
order by a.competition_id, position;
