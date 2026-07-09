import type { Team } from '../../types/database'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

export interface GoalRowDraft {
  team_id: string
  player_name: string
  minute: string
}

export function GoalsReviewForm({
  homeTeam,
  awayTeam,
  rows,
  onChange,
}: {
  homeTeam: Team
  awayTeam: Team
  rows: GoalRowDraft[]
  onChange: (rows: GoalRowDraft[]) => void
}) {
  function updateRow(index: number, patch: Partial<GoalRowDraft>) {
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index))
  }

  function addRow() {
    onChange([...rows, { team_id: homeTeam.id, player_name: '', minute: '' }])
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <Input
            className="w-14"
            value={row.minute}
            onChange={(e) => updateRow(i, { minute: e.target.value })}
            placeholder="Min."
          />
          <Input
            className="flex-1"
            value={row.player_name}
            onChange={(e) => updateRow(i, { player_name: e.target.value })}
            placeholder="Artilheiro"
          />
          <Select className="w-32" value={row.team_id} onChange={(e) => updateRow(i, { team_id: e.target.value })}>
            <option value={homeTeam.id}>{homeTeam.name}</option>
            <option value={awayTeam.id}>{awayTeam.name}</option>
          </Select>
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="text-slate-400 hover:text-red-600"
            aria-label="Remover gol"
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={addRow} className="self-start text-xs font-medium text-emerald-700 hover:underline">
        + Gol
      </button>
    </div>
  )
}
