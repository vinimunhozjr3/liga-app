-- =========================================================
-- 0007_screenshot_stats_rls.sql
-- =========================================================
-- Mesmo padrao do resto do app: qualquer autenticado le/escreve tudo.

alter table public.players               enable row level security;
alter table public.match_screenshots      enable row level security;
alter table public.match_lineup_entries   enable row level security;
alter table public.match_goals            enable row level security;

-- players
create policy "authenticated can select players"
  on public.players for select
  to authenticated using (true);
create policy "authenticated can insert players"
  on public.players for insert
  to authenticated with check (true);
create policy "authenticated can update players"
  on public.players for update
  to authenticated using (true) with check (true);
create policy "authenticated can delete players"
  on public.players for delete
  to authenticated using (true);

-- match_screenshots
create policy "authenticated can select match_screenshots"
  on public.match_screenshots for select
  to authenticated using (true);
create policy "authenticated can insert match_screenshots"
  on public.match_screenshots for insert
  to authenticated with check (true);
create policy "authenticated can update match_screenshots"
  on public.match_screenshots for update
  to authenticated using (true) with check (true);
create policy "authenticated can delete match_screenshots"
  on public.match_screenshots for delete
  to authenticated using (true);

-- match_lineup_entries
create policy "authenticated can select match_lineup_entries"
  on public.match_lineup_entries for select
  to authenticated using (true);
create policy "authenticated can insert match_lineup_entries"
  on public.match_lineup_entries for insert
  to authenticated with check (true);
create policy "authenticated can update match_lineup_entries"
  on public.match_lineup_entries for update
  to authenticated using (true) with check (true);
create policy "authenticated can delete match_lineup_entries"
  on public.match_lineup_entries for delete
  to authenticated using (true);

-- match_goals
create policy "authenticated can select match_goals"
  on public.match_goals for select
  to authenticated using (true);
create policy "authenticated can insert match_goals"
  on public.match_goals for insert
  to authenticated with check (true);
create policy "authenticated can update match_goals"
  on public.match_goals for update
  to authenticated using (true) with check (true);
create policy "authenticated can delete match_goals"
  on public.match_goals for delete
  to authenticated using (true);

-- Storage: bucket privado para os prints originais
insert into storage.buckets (id, name, public)
values ('match-screenshots', 'match-screenshots', false)
on conflict (id) do nothing;

create policy "authenticated can manage match screenshots storage"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'match-screenshots')
  with check (bucket_id = 'match-screenshots');
