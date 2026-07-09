import { EmptyState } from '../ui/EmptyState'

interface LegendsByTeamRow {
  team_id: string
  team_name: string
  legend_appearances: number
}

export function LegendsByTeamTable({ rows }: { rows: LegendsByTeamRow[] }) {
  const withLegends = rows.filter((r) => r.legend_appearances > 0)

  if (withLegends.length === 0) {
    return <EmptyState title="Nenhum jogador Legend escalado ainda" />
  }

  return (
    <ol className="divide-y divide-slate-100 rounded-xl border border-slate-200">
      {withLegends.map((row, i) => (
        <li key={row.team_id} className="flex items-center gap-3 px-4 py-2.5">
          <span className="w-5 text-right text-sm font-semibold text-slate-400">{i + 1}</span>
          <p className="flex-1 truncate text-sm font-medium text-slate-900">{row.team_name}</p>
          <span className="text-sm font-bold text-amber-600">★ {row.legend_appearances}</span>
        </li>
      ))}
    </ol>
  )
}
