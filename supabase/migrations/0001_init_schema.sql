-- =========================================================
-- 0001_init_schema.sql
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- ENUMs
-- ---------------------------------------------------------
create type competition_type as enum ('league_table', 'champion_only');
create type match_status as enum ('scheduled', 'played', 'postponed');

-- ---------------------------------------------------------
-- TABLE: competitions
-- ---------------------------------------------------------
create table public.competitions (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          competition_type not null,
  season        text,
  -- config de zonas coloridas, usado apenas quando type = 'league_table'
  -- formato: [{ "label": "...", "color": "#RRGGBB", "from_position": 1, "to_position": 4 }]
  zones_config  jsonb not null default '[]'::jsonb,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on column public.competitions.zones_config is
  'Array de zonas coloridas para tabela de classificacao: [{label, color, from_position, to_position}]. Vazio para champion_only.';

-- ---------------------------------------------------------
-- TABLE: teams (globais, reutilizaveis entre competicoes)
-- ---------------------------------------------------------
create table public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  coach_name  text,
  crest_url   text,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------
-- TABLE: competition_teams (times participantes de uma competicao)
-- ---------------------------------------------------------
create table public.competition_teams (
  id              uuid primary key default gen_random_uuid(),
  competition_id  uuid not null references public.competitions(id) on delete cascade,
  team_id         uuid not null references public.teams(id) on delete cascade,
  created_at      timestamptz not null default now(),
  unique (competition_id, team_id)
);

create index idx_competition_teams_competition on public.competition_teams(competition_id);
create index idx_competition_teams_team on public.competition_teams(team_id);

-- ---------------------------------------------------------
-- TABLE: matches (apenas para competitions.type = 'league_table')
-- ---------------------------------------------------------
create table public.matches (
  id              uuid primary key default gen_random_uuid(),
  competition_id  uuid not null references public.competitions(id) on delete cascade,
  home_team_id    uuid not null references public.teams(id),
  away_team_id    uuid not null references public.teams(id),
  home_score      integer,
  away_score      integer,
  round           integer,
  match_date      date,
  status          match_status not null default 'scheduled',
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint chk_teams_different check (home_team_id <> away_team_id),
  constraint chk_score_consistency check (
    (status = 'played' and home_score is not null and away_score is not null)
    or (status <> 'played')
  ),
  constraint chk_scores_non_negative check (
    (home_score is null or home_score >= 0) and
    (away_score is null or away_score >= 0)
  )
);

create index idx_matches_competition on public.matches(competition_id);
create index idx_matches_home_team on public.matches(home_team_id);
create index idx_matches_away_team on public.matches(away_team_id);
create index idx_matches_status on public.matches(competition_id, status);

-- ---------------------------------------------------------
-- TABLE: team_titles (apenas para competitions.type = 'champion_only')
-- ---------------------------------------------------------
create table public.team_titles (
  id              uuid primary key default gen_random_uuid(),
  competition_id  uuid not null references public.competitions(id) on delete cascade,
  team_id         uuid not null references public.teams(id) on delete cascade,
  titles_count    integer not null default 0 check (titles_count >= 0),
  updated_at      timestamptz not null default now(),
  unique (competition_id, team_id)
);

create index idx_team_titles_competition on public.team_titles(competition_id);

-- ---------------------------------------------------------
-- Trigger generico para updated_at
-- ---------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_competitions_updated_at
  before update on public.competitions
  for each row execute function public.set_updated_at();

create trigger trg_teams_updated_at
  before update on public.teams
  for each row execute function public.set_updated_at();

create trigger trg_matches_updated_at
  before update on public.matches
  for each row execute function public.set_updated_at();

create trigger trg_team_titles_updated_at
  before update on public.team_titles
  for each row execute function public.set_updated_at();
