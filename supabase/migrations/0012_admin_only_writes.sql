-- =========================================================
-- 0012_admin_only_writes.sql
-- =========================================================
-- Restringe insert/update/delete de todas as tabelas de dados
-- (e do bucket de prints) a usuarios com is_admin = true.
-- Leitura (select) continua liberada pra qualquer autenticado.

-- competitions
drop policy "authenticated can insert competitions" on public.competitions;
drop policy "authenticated can update competitions" on public.competitions;
drop policy "authenticated can delete competitions" on public.competitions;
create policy "admin can insert competitions" on public.competitions for insert to authenticated with check (public.is_admin());
create policy "admin can update competitions" on public.competitions for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin can delete competitions" on public.competitions for delete to authenticated using (public.is_admin());

-- teams
drop policy "authenticated can insert teams" on public.teams;
drop policy "authenticated can update teams" on public.teams;
drop policy "authenticated can delete teams" on public.teams;
create policy "admin can insert teams" on public.teams for insert to authenticated with check (public.is_admin());
create policy "admin can update teams" on public.teams for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin can delete teams" on public.teams for delete to authenticated using (public.is_admin());

-- competition_teams
drop policy "authenticated can insert competition_teams" on public.competition_teams;
drop policy "authenticated can delete competition_teams" on public.competition_teams;
create policy "admin can insert competition_teams" on public.competition_teams for insert to authenticated with check (public.is_admin());
create policy "admin can delete competition_teams" on public.competition_teams for delete to authenticated using (public.is_admin());

-- matches
-- insert continua liberado pra qualquer autenticado (lancamento manual de
-- placar, um jogo por vez, pelo formulario "+ Lancar placar"); update e
-- delete (usados por calendario/resultados em bloco/bulk-delete) ficam
-- restritos a admin.
drop policy "authenticated can update matches" on public.matches;
drop policy "authenticated can delete matches" on public.matches;
create policy "admin can update matches" on public.matches for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin can delete matches" on public.matches for delete to authenticated using (public.is_admin());

-- team_titles
drop policy "authenticated can insert team_titles" on public.team_titles;
drop policy "authenticated can update team_titles" on public.team_titles;
drop policy "authenticated can delete team_titles" on public.team_titles;
create policy "admin can insert team_titles" on public.team_titles for insert to authenticated with check (public.is_admin());
create policy "admin can update team_titles" on public.team_titles for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin can delete team_titles" on public.team_titles for delete to authenticated using (public.is_admin());

-- players
drop policy "authenticated can insert players" on public.players;
drop policy "authenticated can update players" on public.players;
drop policy "authenticated can delete players" on public.players;
create policy "admin can insert players" on public.players for insert to authenticated with check (public.is_admin());
create policy "admin can update players" on public.players for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin can delete players" on public.players for delete to authenticated using (public.is_admin());

-- match_screenshots
drop policy "authenticated can insert match_screenshots" on public.match_screenshots;
drop policy "authenticated can update match_screenshots" on public.match_screenshots;
drop policy "authenticated can delete match_screenshots" on public.match_screenshots;
create policy "admin can insert match_screenshots" on public.match_screenshots for insert to authenticated with check (public.is_admin());
create policy "admin can update match_screenshots" on public.match_screenshots for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin can delete match_screenshots" on public.match_screenshots for delete to authenticated using (public.is_admin());

-- match_lineup_entries
drop policy "authenticated can insert match_lineup_entries" on public.match_lineup_entries;
drop policy "authenticated can update match_lineup_entries" on public.match_lineup_entries;
drop policy "authenticated can delete match_lineup_entries" on public.match_lineup_entries;
create policy "admin can insert match_lineup_entries" on public.match_lineup_entries for insert to authenticated with check (public.is_admin());
create policy "admin can update match_lineup_entries" on public.match_lineup_entries for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin can delete match_lineup_entries" on public.match_lineup_entries for delete to authenticated using (public.is_admin());

-- match_goals
drop policy "authenticated can insert match_goals" on public.match_goals;
drop policy "authenticated can update match_goals" on public.match_goals;
drop policy "authenticated can delete match_goals" on public.match_goals;
create policy "admin can insert match_goals" on public.match_goals for insert to authenticated with check (public.is_admin());
create policy "admin can update match_goals" on public.match_goals for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin can delete match_goals" on public.match_goals for delete to authenticated using (public.is_admin());

-- finals
drop policy "authenticated can insert finals" on public.finals;
drop policy "authenticated can update finals" on public.finals;
drop policy "authenticated can delete finals" on public.finals;
create policy "admin can insert finals" on public.finals for insert to authenticated with check (public.is_admin());
create policy "admin can update finals" on public.finals for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin can delete finals" on public.finals for delete to authenticated using (public.is_admin());

-- rivalries
drop policy "authenticated can insert rivalries" on public.rivalries;
drop policy "authenticated can delete rivalries" on public.rivalries;
create policy "admin can insert rivalries" on public.rivalries for insert to authenticated with check (public.is_admin());
create policy "admin can delete rivalries" on public.rivalries for delete to authenticated using (public.is_admin());

-- round_news
drop policy "authenticated can insert round_news" on public.round_news;
drop policy "authenticated can update round_news" on public.round_news;
drop policy "authenticated can delete round_news" on public.round_news;
create policy "admin can insert round_news" on public.round_news for insert to authenticated with check (public.is_admin());
create policy "admin can update round_news" on public.round_news for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin can delete round_news" on public.round_news for delete to authenticated using (public.is_admin());

-- storage: bucket match-screenshots
drop policy "authenticated can manage match screenshots storage" on storage.objects;
create policy "authenticated can select match screenshots storage"
  on storage.objects for select to authenticated using (bucket_id = 'match-screenshots');
create policy "admin can insert match screenshots storage"
  on storage.objects for insert to authenticated with check (bucket_id = 'match-screenshots' and public.is_admin());
create policy "admin can update match screenshots storage"
  on storage.objects for update to authenticated using (bucket_id = 'match-screenshots' and public.is_admin()) with check (bucket_id = 'match-screenshots' and public.is_admin());
create policy "admin can delete match screenshots storage"
  on storage.objects for delete to authenticated using (bucket_id = 'match-screenshots' and public.is_admin());
