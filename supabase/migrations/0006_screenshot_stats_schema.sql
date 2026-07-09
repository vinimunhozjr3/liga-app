-- =========================================================
-- 0006_screenshot_stats_schema.sql
-- =========================================================
-- Base para importar dados de prints: catalogo de jogadores,
-- prints armazenados, escalacoes e gols por partida.

create table public.players (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

create unique index idx_players_name_unique on public.players (lower(trim(name)));

create table public.match_screenshots (
  id            uuid primary key default gen_random_uuid(),
  match_id      uuid not null references public.matches(id) on delete cascade,
  kind          text not null check (kind in ('lineup', 'goals')),
  storage_path  text not null,
  uploaded_by   uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

create index idx_match_screenshots_match on public.match_screenshots(match_id);

create table public.match_lineup_entries (
  id             uuid primary key default gen_random_uuid(),
  match_id       uuid not null references public.matches(id) on delete cascade,
  team_id        uuid not null references public.teams(id),
  player_id      uuid not null references public.players(id),
  position       text,
  is_legend      boolean not null default false,
  screenshot_id  uuid references public.match_screenshots(id) on delete set null,
  created_at     timestamptz not null default now()
);

create index idx_lineup_match on public.match_lineup_entries(match_id);
create index idx_lineup_player on public.match_lineup_entries(player_id);
create index idx_lineup_team on public.match_lineup_entries(team_id);

create table public.match_goals (
  id             uuid primary key default gen_random_uuid(),
  match_id       uuid not null references public.matches(id) on delete cascade,
  team_id        uuid not null references public.teams(id),
  player_id      uuid not null references public.players(id),
  minute         integer,
  screenshot_id  uuid references public.match_screenshots(id) on delete set null,
  created_at     timestamptz not null default now()
);

create index idx_goals_match on public.match_goals(match_id);
create index idx_goals_player on public.match_goals(player_id);
create index idx_goals_team on public.match_goals(team_id);
