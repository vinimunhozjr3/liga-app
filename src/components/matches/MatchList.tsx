import type { Match, Team } from '../../types/database'
import { MatchListItem } from './MatchListItem'
import { EmptyState } from '../ui/EmptyState'

interface MatchWithTeams extends Match {
  home_team: Team
  away_team: Team
}

export function MatchList({
  matches,
  onDelete,
  selectedIds,
  onToggleSelect,
  onEditScore,
}: {
  matches: MatchWithTeams[]
  onDelete?: (matchId: string) => void
  selectedIds?: Set<string>
  onToggleSelect?: (matchId: string) => void
  onEditScore?: (matchId: string) => void
}) {
  if (matches.length === 0) {
    return <EmptyState title="Nenhum jogo lançado" description="Lance o primeiro placar da competição." />
  }

  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
      {matches.map((match) => (
        <MatchListItem
          key={match.id}
          match={match}
          homeTeam={match.home_team}
          awayTeam={match.away_team}
          onDelete={onDelete ? () => onDelete(match.id) : undefined}
          selected={selectedIds?.has(match.id)}
          onToggleSelect={onToggleSelect ? () => onToggleSelect(match.id) : undefined}
          onEditScore={onEditScore ? () => onEditScore(match.id) : undefined}
        />
      ))}
    </ul>
  )
}
