import type { Team } from '../../types/database'
import { TeamCrest } from '../teams/TeamCrest'
import { TitleCounter } from './TitleCounter'

export interface ChampionRow {
  team: Team
  baseTitlesCount: number
  finalTitlesCount: number
  runnerUpCount: number
}

const RANK_BADGE = [
  'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 ring-2 ring-amber-200', // ouro
  'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800 ring-2 ring-slate-200', // prata
  'bg-gradient-to-br from-orange-400 to-orange-600 text-white ring-2 ring-orange-200', // bronze
]

const RANK_BORDER = ['border-l-amber-400', 'border-l-slate-400', 'border-l-orange-500']

function RankBadge({ position }: { position: number }) {
  const style = RANK_BADGE[position - 1]
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        style ?? 'bg-slate-100 text-slate-500'
      }`}
    >
      {position}
    </span>
  )
}

export function ChampionsRanking({
  rows,
  onChangeBaseCount,
  isAdmin = true,
}: {
  rows: ChampionRow[]
  onChangeBaseCount: (teamId: string, newCount: number) => Promise<void>
  isAdmin?: boolean
}) {
  const sorted = [...rows].sort((a, b) => {
    const totalA = a.baseTitlesCount + a.finalTitlesCount
    const totalB = b.baseTitlesCount + b.finalTitlesCount
    return totalB - totalA || a.team.name.localeCompare(b.team.name)
  })

  return (
    <ol className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
      {sorted.map((row, index) => (
        <li
          key={row.team.id}
          className={`flex items-center gap-3 border-l-4 px-4 py-3 ${RANK_BORDER[index] ?? 'border-l-transparent'}`}
        >
          <RankBadge position={index + 1} />
          <TeamCrest team={row.team} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{row.team.name}</p>
            {row.team.coach_name && (
              <p className="truncate text-xs text-slate-500">Téc. {row.team.coach_name}</p>
            )}
            {row.runnerUpCount > 0 && <p className="text-xs text-slate-400">🥈 {row.runnerUpCount} vice(s)</p>}
          </div>
          <div className="flex items-center gap-1">
            {isAdmin ? (
              <TitleCounter count={row.baseTitlesCount} onChange={(n) => onChangeBaseCount(row.team.id, n)} />
            ) : (
              <span className="text-sm font-semibold text-slate-900">{row.baseTitlesCount}</span>
            )}
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
