-- =========================================================
-- 0009_finals_schema.sql
-- =========================================================
-- Historico de finais (campeao x vice) para competicoes tipo
-- champion_only. Aditivo ao contador simples ja existente em
-- team_titles: o total de titulos exibido soma
-- team_titles.titles_count (saldo base ja cadastrado) com
-- champion_stats.final_titles (contagem detalhada por final).

create table public.finals (
  id                  uuid primary key default gen_random_uuid(),
  competition_id      uuid not null references public.competitions(id) on delete cascade,
  edition             text,
  champion_team_id    uuid not null references public.teams(id),
  runner_up_team_id   uuid not null references public.teams(id),
  champion_score      integer,
  runner_up_score     integer,
  played_at           date,
  created_by          uuid references auth.users(id),
  created_at          timestamptz not null default now(),

  constraint chk_final_teams_different check (champion_team_id <> runner_up_team_id)
);

create index idx_finals_competition on public.finals(competition_id);

alter table public.finals enable row level security;

create policy "authenticated can select finals"
  on public.finals for select
  to authenticated using (true);
create policy "authenticated can insert finals"
  on public.finals for insert
  to authenticated with check (true);
create policy "authenticated can update finals"
  on public.finals for update
  to authenticated using (true) with check (true);
create policy "authenticated can delete finals"
  on public.finals for delete
  to authenticated using (true);

create or replace view public.champion_stats
with (security_invoker = true) as
with titles as (
  select competition_id, champion_team_id as team_id, count(*) as final_titles
  from public.finals
  group by competition_id, champion_team_id
),
runner_ups as (
  select competition_id, runner_up_team_id as team_id, count(*) as runner_up_count
  from public.finals
  group by competition_id, runner_up_team_id
)
select
  coalesce(t.competition_id, r.competition_id) as competition_id,
  coalesce(t.team_id, r.team_id) as team_id,
  coalesce(t.final_titles, 0) as final_titles,
  coalesce(r.runner_up_count, 0) as runner_up_count
from titles t
full join runner_ups r
  on t.competition_id = r.competition_id and t.team_id = r.team_id;
