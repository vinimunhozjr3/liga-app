import { useState } from 'react'
import { useRivalries } from '../../hooks/useRivalries'
import type { Team } from '../../types/database'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { Modal } from '../ui/Modal'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'

export function ManageRivalriesModal({
  open,
  onClose,
  teams,
}: {
  open: boolean
  onClose: () => void
  teams: Team[]
}) {
  const { rivalries, loading, addRivalry, deleteRivalry } = useRivalries()
  const [teamAId, setTeamAId] = useState('')
  const [teamBId, setTeamBId] = useState('')
  const [rivalAll, setRivalAll] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd() {
    if (!teamAId || (!rivalAll && !teamBId)) return
    if (!rivalAll && teamAId === teamBId) {
      setError('Selecione dois times diferentes.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await addRivalry(teamAId, rivalAll ? null : teamBId)
      setTeamAId('')
      setTeamBId('')
      setRivalAll(false)
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao adicionar rivalidade.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Gerenciar rivalidades">
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : rivalries.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma rivalidade cadastrada ainda.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {rivalries.map((r) => (
              <li key={r.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <span>
                  {r.team_a.name} <span className="text-slate-400">x</span> {r.team_b ? r.team_b.name : 'todo mundo'}
                </span>
                <button
                  onClick={() => deleteRivalry(r.id)}
                  className="text-xs text-slate-400 hover:text-red-600"
                  aria-label="Remover rivalidade"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
          <p className="text-sm font-medium text-slate-700">Nova rivalidade</p>
          <Select value={teamAId} onChange={(e) => setTeamAId(e.target.value)}>
            <option value="" disabled>
              Time A
            </option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={rivalAll} onChange={(e) => setRivalAll(e.target.checked)} />
            É rival de todo mundo
          </label>
          {!rivalAll && (
            <Select value={teamBId} onChange={(e) => setTeamBId(e.target.value)}>
              <option value="" disabled>
                Time B
              </option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button onClick={handleAdd} disabled={saving || !teamAId || (!rivalAll && !teamBId)}>
            {saving ? 'Salvando...' : '+ Adicionar rivalidade'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
