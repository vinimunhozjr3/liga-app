import type { Team } from '../../types/database'
import { Input } from '../ui/Input'

export interface LineupRowDraft {
  player_name: string
  position: string
  is_legend: boolean
}

function TeamLineupEditor({
  team,
  rows,
  onChange,
}: {
  team: Team
  rows: LineupRowDraft[]
  onChange: (rows: LineupRowDraft[]) => void
}) {
  function updateRow(index: number, patch: Partial<LineupRowDraft>) {
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index))
  }

  function addRow() {
    onChange([...rows, { player_name: '', position: '', is_legend: false }])
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-slate-700">{team.name}</p>
      <div className="flex flex-col gap-1.5">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Input
              className="flex-1"
              value={row.player_name}
              onChange={(e) => updateRow(i, { player_name: e.target.value })}
              placeholder="Jogador"
            />
            <Input
              className="w-16"
              value={row.position}
              onChange={(e) => updateRow(i, { position: e.target.value })}
              placeholder="Pos."
            />
            <label className="flex items-center gap-1 text-xs text-amber-700" title="Legend">
              <input
                type="checkbox"
                checked={row.is_legend}
                onChange={(e) => updateRow(i, { is_legend: e.target.checked })}
              />
              ★
            </label>
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="text-slate-400 hover:text-red-600"
              aria-label="Remover jogador"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addRow} className="self-start text-xs font-medium text-emerald-700 hover:underline">
        + Jogador
      </button>
    </div>
  )
}

export function LineupReviewForm({
  homeTeam,
  awayTeam,
  homeRows,
  awayRows,
  onChangeHome,
  onChangeAway,
}: {
  homeTeam: Team
  awayTeam: Team
  homeRows: LineupRowDraft[]
  awayRows: LineupRowDraft[]
  onChangeHome: (rows: LineupRowDraft[]) => void
  onChangeAway: (rows: LineupRowDraft[]) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <TeamLineupEditor team={homeTeam} rows={homeRows} onChange={onChangeHome} />
      <TeamLineupEditor team={awayTeam} rows={awayRows} onChange={onChangeAway} />
    </div>
  )
}
