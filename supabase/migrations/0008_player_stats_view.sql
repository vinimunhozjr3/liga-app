-- =========================================================
-- 0008_player_stats_view.sql
-- =========================================================
-- Estatisticas agregadas por jogador: aparicoes, aparicoes como
-- legend e gols, por competicao e time. Alimenta "mais escalados",
-- "artilheiros" e "times que mais escalam legends" (essa ultima
-- somada por time no client).

create or replace view public.player_stats
with (security_invoker = true) as
with appearances as (
  select
    m.competition_id,
    le.team_id,
    le.player_id,
    count(*) as appearances,
    count(*) filter (where le.is_legend) as legend_appearances
  from public.match_lineup_entries le
  join public.matches m on m.id = le.match_id
  group by m.competition_id, le.team_id, le.player_id
),
goals as (
  select
    m.competition_id,
    g.team_id,
    g.player_id,
    count(*) as goals
  from public.match_goals g
  join public.matches m on m.id = g.match_id
  group by m.competition_id, g.team_id, g.player_id
)
select
  coalesce(a.competition_id, g.competition_id) as competition_id,
  coalesce(a.team_id, g.team_id) as team_id,
  coalesce(a.player_id, g.player_id) as player_id,
  p.name as player_name,
  t.name as team_name,
  coalesce(a.appearances, 0) as appearances,
  coalesce(a.legend_appearances, 0) as legend_appearances,
  coalesce(g.goals, 0) as goals
from appearances a
full join goals g
  on a.competition_id = g.competition_id
  and a.team_id = g.team_id
  and a.player_id = g.player_id
join public.players p on p.id = coalesce(a.player_id, g.player_id)
join public.teams t on t.id = coalesce(a.team_id, g.team_id)
order by competition_id, goals desc, appearances desc;
