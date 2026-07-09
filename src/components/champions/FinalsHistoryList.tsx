import type { Final, Team } from '../../types/database'
import { EmptyState } from '../ui/EmptyState'

interface FinalRow extends Final {
  champion_team: Team
  runner_up_team: Team
}

export function FinalsHistoryList({ finals, onDelete }: { finals: FinalRow[]; onDelete: (id: string) => void }) {
  if (finals.length === 0) {
    return <EmptyState title="Nenhuma final registrada ainda" />
  }

  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
      {finals.map((final) => (
        <li key={final.id} className="flex items-center gap-3 px-4 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">
              <span className="font-medium text-slate-900">{final.champion_team.name}</span>
              {final.champion_score != null && final.runner_up_score != null && (
                <span className="text-slate-500"> {final.champion_score} x {final.runner_up_score} </span>
              )}
              {!(final.champion_score != null && final.runner_up_score != null) && <span className="text-slate-400"> x </span>}
              <span className="text-slate-600">{final.runner_up_team.name}</span>
            </p>
            {final.edition && <p className="text-xs text-slate-500">{final.edition}</p>}
          </div>
          <button onClick={() => onDelete(final.id)} className="text-xs text-slate-400 hover:text-red-600" aria-label="Remover final">
            ✕
          </button>
        </li>
      ))}
    </ul>
  )
}
