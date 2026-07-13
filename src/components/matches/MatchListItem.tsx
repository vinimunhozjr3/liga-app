import type { Match, Team } from '../../types/database'
import { TeamCrest } from '../teams/TeamCrest'

export function MatchListItem({
  match,
  homeTeam,
  awayTeam,
  onDelete,
  selected = false,
  onToggleSelect,
  onEditScore,
}: {
  match: Match
  homeTeam: Team
  awayTeam: Team
  onDelete?: () => void
  selected?: boolean
  onToggleSelect?: () => void
  onEditScore?: () => void
}) {
  const penaltyWinner =
    match.penalty_winner_team_id === homeTeam.id
      ? homeTeam
      : match.penalty_winner_team_id === awayTeam.id
        ? awayTeam
        : null

  const isScheduled = match.status === 'scheduled'

  return (
    <li className="flex flex-col gap-1 px-4 py-3">
      <div className="flex items-center gap-3">
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="h-4 w-4 shrink-0"
            aria-label="Selecionar jogo"
          />
        )}
        <div className="flex flex-1 items-center justify-end gap-2">
          <span className="truncate text-sm text-slate-900">{homeTeam.name}</span>
          <TeamCrest team={homeTeam} size={28} />
        </div>
        {isScheduled ? (
          onEditScore ? (
            <button
              type="button"
              onClick={onEditScore}
              className="flex flex-col items-center rounded-full bg-amber-100 px-3 py-1.5 text-xs text-amber-800 hover:bg-amber-200"
            >
              <span className="font-semibold">Lançar placar</span>
              {match.round != null && <span className="text-[10px] text-amber-600">Rodada {match.round}</span>}
            </button>
          ) : (
            <div className="flex flex-col items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-500">
              <span>Agendado</span>
              {match.round != null && <span className="text-[10px] text-slate-400">Rodada {match.round}</span>}
            </div>
          )
        ) : (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-900">
            <span>{match.home_score}</span>
            <span className="text-emerald-400">x</span>
            <span>{match.away_score}</span>
          </div>
        )}
        <div className="flex flex-1 items-center gap-2">
          <TeamCrest team={awayTeam} size={28} />
          <span className="truncate text-sm text-slate-900">{awayTeam.name}</span>
        </div>
        {onDelete && (
          <button onClick={onDelete} className="text-xs text-slate-400 hover:text-red-600" aria-label="Remover jogo">
            ✕
          </button>
        )}
      </div>
      {penaltyWinner && (
        <p className="text-center text-xs text-amber-600">{penaltyWinner.name} venceu nos pênaltis</p>
      )}
    </li>
  )
}
