-- =========================================================
-- 0004_add_penalty_winner.sql
-- =========================================================
-- Quando o jogo termina empatado, o grupo decide nos penaltis.
-- O placar normal ainda vale para pontos (empate = 1 pt pra cada),
-- mas o vencedor dos penaltis e usado como criterio de desempate
-- na tabela (logo apos pontos, antes do saldo de gols).

alter table public.matches
  add column penalty_winner_team_id uuid references public.teams(id);

alter table public.matches
  add constraint chk_penalty_winner_only_on_draw check (
    penalty_winner_team_id is null
    or (
      home_score is not null
      and away_score is not null
      and home_score = away_score
      and (penalty_winner_team_id = home_team_id or penalty_winner_team_id = away_team_id)
    )
  );
