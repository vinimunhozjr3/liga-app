import type { Match } from '../types/database'

export function computeTeamRecord(matches: Match[], teamId: string) {
  let wins = 0
  let draws = 0
  let losses = 0

  for (const m of matches) {
    if (m.status !== 'played' || m.home_score == null || m.away_score == null) continue
    const isHome = m.home_team_id === teamId
    if (!isHome && m.away_team_id !== teamId) continue

    const forScore = isHome ? m.home_score : m.away_score
    const againstScore = isHome ? m.away_score : m.home_score

    if (forScore > againstScore) wins++
    else if (forScore === againstScore) draws++
    else losses++
  }

  return { wins, draws, losses }
}
