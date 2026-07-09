import type { Zone } from '../types/database'

export function zoneForPosition(zones: Zone[], position: number): Zone | null {
  return zones.find((z) => position >= z.from_position && position <= z.to_position) ?? null
}
