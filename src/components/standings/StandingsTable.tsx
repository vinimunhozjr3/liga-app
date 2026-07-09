import type { StandingsRow as StandingsRowType, Zone } from '../../types/database'
import { StandingsRow } from './StandingsRow'
import { ZoneLegend } from './ZoneLegend'
import { EmptyState } from '../ui/EmptyState'

export function StandingsTable({ standings, zones }: { standings: StandingsRowType[]; zones: Zone[] }) {
  if (standings.length === 0) {
    return <EmptyState title="Nenhum time nessa competição" description="Adicione times para ver a tabela." />
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-400">
              <th className="py-2 pl-3 pr-1 text-left font-medium">#</th>
              <th className="py-2 pr-2"></th>
              <th className="py-2 pr-3 text-left font-medium">Clube</th>
              <th className="px-2 py-2 font-medium">Pts</th>
              <th className="px-2 py-2 font-medium">PJ</th>
              <th className="px-2 py-2 font-medium">VIT</th>
              <th className="px-2 py-2 font-medium">E</th>
              <th className="px-2 py-2 font-medium">DER</th>
              <th className="hidden px-2 py-2 font-medium sm:table-cell">GM</th>
              <th className="hidden px-2 py-2 font-medium sm:table-cell">GC</th>
              <th className="px-2 py-2 font-medium">SG</th>
              <th className="px-3 py-2 text-left font-medium">Últimas 5</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <StandingsRow key={row.team_id} row={row} zones={zones} />
            ))}
          </tbody>
        </table>
      </div>
      <ZoneLegend zones={zones} />
    </div>
  )
}
