import { useState } from 'react'
import { useRoundSelection, type SelectionEntry } from '../../hooks/useRoundSelection'
import { Select } from '../ui/Select'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../ui/EmptyState'

function PlayerChip({ entry, label }: { entry: SelectionEntry; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg bg-slate-50 px-2 py-2 text-center">
      <span className="text-[10px] font-semibold uppercase text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-900">
        {entry.player_name}
        {entry.is_legend && <span className="ml-0.5 text-amber-500">★</span>}
      </span>
      <span className="text-[11px] text-slate-500">{entry.team_name}</span>
      {entry.goals_in_round > 0 && <span className="text-[11px] text-emerald-600">{entry.goals_in_round} gol(s)</span>}
    </div>
  )
}

export function RoundSelectionPanel({ competitionId, rounds }: { competitionId: string; rounds: number[] }) {
  const [round, setRound] = useState<number | null>(rounds[0] ?? null)
  const { selection, loading, error } = useRoundSelection(competitionId, round)

  if (rounds.length === 0) {
    return <EmptyState title="Nenhuma rodada com jogos importados ainda" />
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-slate-500">
        O time ideal (1-4-3-3) é escolhido automaticamente pelo app com base nos gols e na defesa da rodada — só
        escolha a rodada abaixo, não precisa selecionar os jogadores.
      </p>
      <Select value={round ?? ''} onChange={(e) => setRound(Number(e.target.value))}>
        {rounds.map((r) => (
          <option key={r} value={r}>
            Rodada {r}
          </option>
        ))}
      </Select>

      {loading && (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && selection && (
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-emerald-50/40 p-3">
          <div className="grid grid-cols-3 gap-2">
            {selection.ataque.map((e) => (
              <PlayerChip key={e.player_id} entry={e} label="ATA" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {selection.meio.map((e) => (
              <PlayerChip key={e.player_id} entry={e} label="MEI" />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {selection.defesa.map((e) => (
              <PlayerChip key={e.player_id} entry={e} label="DEF" />
            ))}
          </div>
          {selection.goleiro && (
            <div className="mx-auto w-1/2">
              <PlayerChip entry={selection.goleiro} label="GOL" />
            </div>
          )}
          {!selection.goleiro && selection.defesa.length === 0 && selection.meio.length === 0 && selection.ataque.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-500">
              Sem escalações importadas pra essa rodada ainda.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
