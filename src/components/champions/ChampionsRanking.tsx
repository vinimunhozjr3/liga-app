import type { Team } from '../../types/database'
import { TeamCrest } from '../teams/TeamCrest'
import { TitleCounter } from './TitleCounter'

export interface ChampionRow {
  team: Team
  baseTitlesCount: number
  finalTitlesCount: number
  runnerUpCount: number
}

export function ChampionsRanking({
  rows,
  onChangeBaseCount,
}: {
  rows: ChampionRow[]
  onChangeBaseCount: (teamId: string, newCount: number) => Promise<void>
}) {
  const sorted = [...rows].sort((a, b) => {
    const totalA = a.baseTitlesCount + a.finalTitlesCount
    const totalB = b.baseTitlesCount + b.finalTitlesCount
    return totalB - totalA || a.team.name.localeCompare(b.team.name)
  })

  return (
    <ol className="divide-y divide-slate-100 rounded-xl border border-slate-200">
      {sorted.map((row, index) => (
        <li key={row.team.id} className="flex items-center gap-3 px-4 py-3">
          <span className="w-5 text-right text-sm font-semibold text-slate-400">{index + 1}</span>
          <TeamCrest team={row.team} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{row.team.name}</p>
            {row.team.coach_name && (
              <p className="truncate text-xs text-slate-500">Téc. {row.team.coach_name}</p>
            )}
            {row.runnerUpCount > 0 && <p className="text-xs text-slate-400">🥈 {row.runnerUpCount} vice(s)</p>}
          </div>
          <div className="flex items-center gap-1">
            <TitleCounter count={row.baseTitlesCount} onChange={(n) => onChangeBaseCount(row.team.id, n)} />
            {row.finalTitlesCount > 0 && (
              <span className="text-xs text-slate-400" title="Títulos vindos de finais registradas">
                +{row.finalTitlesCount}
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
