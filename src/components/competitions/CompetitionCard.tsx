import { Link } from 'react-router-dom'
import type { Competition } from '../../types/database'
import { CompetitionTypeBadge } from './CompetitionTypeBadge'
import { CompetitionTypeIcon } from './CompetitionTypeIcon'

export function CompetitionCard({ competition }: { competition: Competition }) {
  return (
    <Link
      to={`/competitions/${competition.id}`}
      className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 hover:border-emerald-400 hover:bg-emerald-50/40"
    >
      <CompetitionTypeIcon type={competition.type} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900">{competition.name}</p>
        {competition.season && <p className="text-xs text-slate-500">{competition.season}</p>}
      </div>
      <CompetitionTypeBadge type={competition.type} />
    </Link>
  )
}
