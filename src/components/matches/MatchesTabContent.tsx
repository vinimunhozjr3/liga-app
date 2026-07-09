import { useState } from 'react'
import type { Team } from '../../types/database'
import type { MatchRow } from '../../hooks/useMatches'
import { computeTeamRecord } from '../../utils/matchRecord'
import { RoundGroup } from './RoundGroup'
import { MatchList } from './MatchList'
import { TeamRecordSummary } from './TeamRecordSummary'
import { Select } from '../ui/Select'
import { EmptyState } from '../ui/EmptyState'

export function MatchesTabContent({
  matches,
  teams,
  onDelete,
}: {
  matches: MatchRow[]
  teams: Team[]
  onDelete: (matchId: string) => void
}) {
  const [teamFilter, setTeamFilter] = useState('')
  const [showPast, setShowPast] = useState(false)

  if (matches.length === 0) {
    return <EmptyState title="Nenhum jogo lançado" description="Lance o primeiro placar da competição." />
  }

  const teamFilterSelect = (
    <Select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
      <option value="">Todos os times</option>
      {teams.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </Select>
  )

  if (teamFilter) {
    const team = teams.find((t) => t.id === teamFilter)!
    const teamMatches = matches
      .filter((m) => m.home_team_id === teamFilter || m.away_team_id === teamFilter)
      .sort((a, b) => (a.round ?? 0) - (b.round ?? 0))
    const record = computeTeamRecord(teamMatches, teamFilter)

    return (
      <div className="flex flex-col gap-3">
        {teamFilterSelect}
        <TeamRecordSummary teamName={team.name} wins={record.wins} draws={record.draws} losses={record.losses} />
        <MatchList matches={teamMatches} onDelete={onDelete} />
      </div>
    )
  }

  const byRound = new Map<number, MatchRow[]>()
  const noRound: MatchRow[] = []
  for (const m of matches) {
    if (m.round == null) {
      noRound.push(m)
      continue
    }
    if (!byRound.has(m.round)) byRound.set(m.round, [])
    byRound.get(m.round)!.push(m)
  }

  const roundNumbers = [...byRound.keys()].sort((a, b) => a - b)
  const roundsWithScheduled = roundNumbers.filter((r) => byRound.get(r)!.some((m) => m.status === 'scheduled'))
  const currentRound = roundsWithScheduled.length > 0 ? roundsWithScheduled[0] : roundNumbers[roundNumbers.length - 1]
  const otherRounds = roundNumbers.filter((r) => r !== currentRound).sort((a, b) => b - a)

  return (
    <div className="flex flex-col gap-3">
      {teamFilterSelect}

      {noRound.length > 0 && <MatchList matches={noRound} onDelete={onDelete} />}

      {currentRound != null && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Rodada atual</p>
          <RoundGroup round={currentRound} matches={byRound.get(currentRound)!} onDelete={onDelete} defaultExpanded />
        </div>
      )}

      {otherRounds.length > 0 && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowPast((v) => !v)}
            className="self-start text-sm font-medium text-emerald-700 hover:underline"
          >
            {showPast ? 'Esconder outras rodadas' : `Ver outras rodadas (${otherRounds.length})`}
          </button>
          {showPast && (
            <div className="flex flex-col gap-2">
              {otherRounds.map((r) => (
                <RoundGroup key={r} round={r} matches={byRound.get(r)!} onDelete={onDelete} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
