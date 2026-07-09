-- =========================================================
-- 0010_rivalries_and_news.sql
-- =========================================================
-- Rivalidades entre times (globais, nao presas a uma competicao)
-- e noticias de rodada geradas por IA.

create table public.rivalries (
  id           uuid primary key default gen_random_uuid(),
  team_a_id    uuid not null references public.teams(id) on delete cascade,
  team_b_id    uuid references public.teams(id) on delete cascade,
  created_at   timestamptz not null default now(),

  constraint chk_rivalry_teams_different check (team_b_id is null or team_a_id <> team_b_id)
);

create index idx_rivalries_team_a on public.rivalries(team_a_id);
create index idx_rivalries_team_b on public.rivalries(team_b_id);

alter table public.rivalries enable row level security;

create policy "authenticated can select rivalries"
  on public.rivalries for select
  to authenticated using (true);
create policy "authenticated can insert rivalries"
  on public.rivalries for insert
  to authenticated with check (true);
create policy "authenticated can delete rivalries"
  on public.rivalries for delete
  to authenticated using (true);

create table public.round_news (
  id              uuid primary key default gen_random_uuid(),
  competition_id  uuid not null references public.competitions(id) on delete cascade,
  round           integer not null,
  title           text not null,
  body            text not null,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),

  unique (competition_id, round)
);

create index idx_round_news_competition on public.round_news(competition_id);

alter table public.round_news enable row level security;

create policy "authenticated can select round_news"
  on public.round_news for select
  to authenticated using (true);
create policy "authenticated can insert round_news"
  on public.round_news for insert
  to authenticated with check (true);
create policy "authenticated can update round_news"
  on public.round_news for update
  to authenticated using (true) with check (true);
create policy "authenticated can delete round_news"
  on public.round_news for delete
  to authenticated using (true);
