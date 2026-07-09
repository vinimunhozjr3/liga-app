import type { Team } from '../types/database'

export function resolveTeamId(rawName: string, teams: Team[]): string | null {
  const normalized = rawName.trim().toLowerCase()
  const exact = teams.find((t) => t.name.trim().toLowerCase() === normalized)
  if (exact) return exact.id
  const prefix = teams.find((t) => t.name.trim().toLowerCase().startsWith(normalized))
  if (prefix) return prefix.id
  return null
}
