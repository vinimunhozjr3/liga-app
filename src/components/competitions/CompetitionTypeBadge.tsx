import type { CompetitionType } from '../../types/database'

export function CompetitionTypeBadge({ type }: { type: CompetitionType }) {
  const isLeague = type === 'league_table'
  return (
    <span className="inline-block rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold text-amber-900">
      {isLeague ? 'Tabela' : 'Campeão'}
    </span>
  )
}
