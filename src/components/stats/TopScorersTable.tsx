import type { PlayerStats } from '../../types/database'
import { EmptyState } from '../ui/EmptyState'

export function TopScorersTable({ rows }: { rows: PlayerStats[] }) {
  if (rows.length === 0) {
    return <EmptyState title="Nenhum gol importado ainda" />
  }

  return (
    <ol className="divide-y divide-slate-100 rounded-xl border border-slate-200">
      {rows.slice(0, 20).map((row, i) => (
        <li key={`${row.team_id}-${row.player_id}`} className="flex items-center gap-3 px-4 py-2.5">
          <span className="w-5 text-right text-sm font-semibold text-slate-400">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {row.player_name}
              {row.legend_appearances > 0 && <span className="ml-1 text-amber-500">★</span>}
            </p>
            <p className="truncate text-xs text-slate-500">{row.team_name}</p>
          </div>
          <span className="text-sm font-bold text-slate-900">{row.goals}</span>
        </li>
      ))}
    </ol>
  )
}
