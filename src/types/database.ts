export type CompetitionType = 'league_table' | 'champion_only'
export type MatchStatus = 'scheduled' | 'played' | 'postponed'

export interface Zone {
  label: string
  color: string
  from_position: number
  to_position: number
}

export interface Competition {
  id: string
  name: string
  type: CompetitionType
  season: string | null
  zones_config: Zone[]
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  coach_name: string | null
  crest_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CompetitionTeam {
  id: string
  competition_id: string
  team_id: string
  created_at: string
}

export interface Match {
  id: string
  competition_id: string
  home_team_id: string
  away_team_id: string
  home_score: number | null
  away_score: number | null
  penalty_winner_team_id: string | null
  round: number | null
  match_date: string | null
  status: MatchStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface TeamTitle {
  id: string
  competition_id: string
  team_id: string
  titles_count: number
  updated_at: string
}

export interface Final {
  id: string
  competition_id: string
  edition: string | null
  champion_team_id: string
  runner_up_team_id: string
  champion_score: number | null
  runner_up_score: number | null
  played_at: string | null
  created_by: string | null
  created_at: string
}

export interface ChampionStats {
  competition_id: string
  team_id: string
  final_titles: number
  runner_up_count: number
}

export interface StandingsRow {
  competition_id: string
  team_id: string
  team_name: string
  crest_url: string | null
  coach_name: string | null
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_diff: number
  points: number
  penalty_wins: number
  last_five: string[]
  position: number
}

export interface Player {
  id: string
  name: string
  created_at: string
}

export type ScreenshotKind = 'lineup' | 'goals'

export interface MatchScreenshot {
  id: string
  match_id: string
  kind: ScreenshotKind
  storage_path: string
  uploaded_by: string | null
  created_at: string
}

export interface MatchLineupEntry {
  id: string
  match_id: string
  team_id: string
  player_id: string
  position: string | null
  is_legend: boolean
  screenshot_id: string | null
  created_at: string
}

export interface MatchGoal {
  id: string
  match_id: string
  team_id: string
  player_id: string
  minute: number | null
  screenshot_id: string | null
  created_at: string
}

export interface PlayerStats {
  competition_id: string
  team_id: string
  player_id: string
  player_name: string
  team_name: string
  appearances: number
  legend_appearances: number
  goals: number
}
