import type { MatchRow } from '../hooks/useMatches'

export function findSpotlightMatch(matches: MatchRow[]): MatchRow | null {
  const scheduled = [...matches]
    .filter((m) => m.status === 'scheduled')
    .sort((a, b) => (a.round ?? Infinity) - (b.round ?? Infinity))
  if (scheduled.length > 0) return scheduled[0]

  const played = [...matches]
    .filter((m) => m.status === 'played')
    .sort((a, b) => (b.round ?? 0) - (a.round ?? 0))
  return played[0] ?? null
}
