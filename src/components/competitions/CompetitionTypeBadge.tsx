import type { CompetitionType } from '../../types/database'

export function CompetitionTypeBadge({ type }: { type: CompetitionType }) {
  const isLeague = type === 'league_table'
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        isLeague ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
      }`}
    >
      {isLeague ? 'Tabela' : 'Campeão'}
    </span>
  )
}
