-- =========================================================
-- 0002_rls_policies.sql
-- =========================================================
-- Estrategia: grupo unico de amigos. Qualquer usuario autenticado
-- pode ler e escrever em tudo. created_by fica registrado para
-- uso futuro, sem restringir permissoes agora.

alter table public.competitions       enable row level security;
alter table public.teams              enable row level security;
alter table public.competition_teams  enable row level security;
alter table public.matches            enable row level security;
alter table public.team_titles        enable row level security;

-- competitions
create policy "authenticated can select competitions"
  on public.competitions for select
  to authenticated using (true);

create policy "authenticated can insert competitions"
  on public.competitions for insert
  to authenticated with check (true);

create policy "authenticated can update competitions"
  on public.competitions for update
  to authenticated using (true) with check (true);

create policy "authenticated can delete competitions"
  on public.competitions for delete
  to authenticated using (true);

-- teams
create policy "authenticated can select teams"
  on public.teams for select
  to authenticated using (true);

create policy "authenticated can insert teams"
  on public.teams for insert
  to authenticated with check (true);

create policy "authenticated can update teams"
  on public.teams for update
  to authenticated using (true) with check (true);

create policy "authenticated can delete teams"
  on public.teams for delete
  to authenticated using (true);

-- competition_teams
create policy "authenticated can select competition_teams"
  on public.competition_teams for select
  to authenticated using (true);

create policy "authenticated can insert competition_teams"
  on public.competition_teams for insert
  to authenticated with check (true);

create policy "authenticated can delete competition_teams"
  on public.competition_teams for delete
  to authenticated using (true);

-- matches
create policy "authenticated can select matches"
  on public.matches for select
  to authenticated using (true);

create policy "authenticated can insert matches"
  on public.matches for insert
  to authenticated with check (true);

create policy "authenticated can update matches"
  on public.matches for update
  to authenticated using (true) with check (true);

create policy "authenticated can delete matches"
  on public.matches for delete
  to authenticated using (true);

-- team_titles
create policy "authenticated can select team_titles"
  on public.team_titles for select
  to authenticated using (true);

create policy "authenticated can insert team_titles"
  on public.team_titles for insert
  to authenticated with check (true);

create policy "authenticated can update team_titles"
  on public.team_titles for update
  to authenticated using (true) with check (true);

create policy "authenticated can delete team_titles"
  on public.team_titles for delete
  to authenticated using (true);
