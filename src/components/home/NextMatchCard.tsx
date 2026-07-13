import { Link } from 'react-router-dom'
import type { Competition } from '../../types/database'
import { useMatches } from '../../hooks/useMatches'
import { findSpotlightMatch } from '../../utils/findSpotlightMatch'
import { TeamCrest } from '../teams/TeamCrest'

export function NextMatchCard({ competition }: { competition: Competition }) {
  const { matches, loading } = useMatches(competition.id)

  if (loading) return null

  const match = findSpotlightMatch(matches)
  if (!match) return null

  const isScheduled = match.status === 'scheduled'

  return (
    <Link
      to={`/competitions/${competition.id}?tab=matches`}
      className="block rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-4 text-white shadow-md transition-shadow hover:shadow-lg"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-200">{competition.name}</span>
        {match.round != null && (
          <span className="text-xs font-medium text-emerald-200">Rodada {match.round}</span>
        )}
      </div>
      <div className="flex items-center justify-center gap-3">
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <TeamCrest team={match.home_team} size={44} />
          <span className="w-full truncate text-center text-sm font-semibold">{match.home_team.name}</span>
        </div>
        {isScheduled ? (
          <span className="text-base font-black text-emerald-200">VS</span>
        ) : (
          <span className="text-2xl font-black tabular-nums">
            {match.home_score} - {match.away_score}
          </span>
        )}
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <TeamCrest team={match.away_team} size={44} />
          <span className="w-full truncate text-center text-sm font-semibold">{match.away_team.name}</span>
        </div>
      </div>
      <p className="mt-3 text-center text-xs font-medium text-emerald-200">
        {isScheduled ? 'Próximo jogo — toque para lançar o placar' : 'Último resultado — toque para ver os jogos'}
      </p>
    </Link>
  )
}
