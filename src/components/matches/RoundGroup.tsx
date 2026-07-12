import { useState } from 'react'
import type { MatchRow } from '../../hooks/useMatches'
import { MatchList } from './MatchList'

export function RoundGroup({
  round,
  matches,
  onDelete,
  defaultExpanded = false,
  selectedIds,
  onToggleSelect,
}: {
  round: number
  matches: MatchRow[]
  onDelete?: (matchId: string) => void
  defaultExpanded?: boolean
  selectedIds?: Set<string>
  onToggleSelect?: (matchId: string) => void
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const playedCount = matches.filter((m) => m.status === 'played').length

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
      >
        <span>Rodada {round}</span>
        <span className="flex items-center gap-2 text-xs text-slate-500">
          {playedCount}/{matches.length} jogos
          <span>{expanded ? '▲' : '▼'}</span>
        </span>
      </button>
      {expanded && (
        <MatchList matches={matches} onDelete={onDelete} selectedIds={selectedIds} onToggleSelect={onToggleSelect} />
      )}
    </div>
  )
}
