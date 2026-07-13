import type { CompetitionType } from '../../types/database'

export function CompetitionTypeIcon({ type }: { type: CompetitionType }) {
  const src = type === 'league_table' ? '/icons/field.png' : '/icons/trophy.png'
  return <img src={src} alt="" className="h-11 w-11 shrink-0 object-contain" />
}
