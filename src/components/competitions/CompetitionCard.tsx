import { Link } from 'react-router-dom'
import type { Competition } from '../../types/database'
import { CompetitionTypeBadge } from './CompetitionTypeBadge'

export function CompetitionCard({ competition }: { competition: Competition }) {
  return (
    <Link
      to={`/competitions/${competition.id}`}
      className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:border-emerald-400 hover:bg-emerald-50/40"
    >
      <div>
        <p className="font-medium text-slate-900">{competition.name}</p>
        {competition.season && <p className="text-xs text-slate-500">{competition.season}</p>}
      </div>
      <CompetitionTypeBadge type={competition.type} />
    </Link>
  )
}
