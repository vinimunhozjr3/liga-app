import { Link } from 'react-router-dom'
import type { Competition } from '../../types/database'
import { CompetitionTypeIcon } from './CompetitionTypeIcon'

export function CompetitionHeader({ competition, isAdmin }: { competition: Competition; isAdmin: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <CompetitionTypeIcon type={competition.type} />
        <div>
          <h1 className="text-2xl font-extrabold leading-tight text-slate-900">{competition.name}</h1>
          {competition.season && <p className="text-xs text-slate-500">{competition.season}</p>}
        </div>
      </div>
      {isAdmin && (
        <Link
          to={`/competitions/${competition.id}/settings`}
          className="shrink-0 text-sm text-slate-500 hover:underline"
        >
          Configurações
        </Link>
      )}
    </div>
  )
}
