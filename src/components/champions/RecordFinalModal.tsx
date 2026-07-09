import { useState, type FormEvent } from 'react'
import type { Team } from '../../types/database'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'

export function RecordFinalModal({
  open,
  onClose,
  teams,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  teams: Team[]
  onSubmit: (input: {
    champion_team_id: string
    runner_up_team_id: string
    edition: string | null
    champion_score: number | null
    runner_up_score: number | null
    played_at: string | null
  }) => Promise<void>
}) {
  const [championId, setChampionId] = useState('')
  const [runnerUpId, setRunnerUpId] = useState('')
  const [edition, setEdition] = useState('')
  const [championScore, setChampionScore] = useState('')
  const [runnerUpScore, setRunnerUpScore] = useState('')
  const [playedAt, setPlayedAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (championId === runnerUpId) {
      setError('Campeão e vice precisam ser times diferentes.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSubmit({
        champion_team_id: championId,
        runner_up_team_id: runnerUpId,
        edition: edition.trim() || null,
        champion_score: championScore ? Number(championScore) : null,
        runner_up_score: runnerUpScore ? Number(runnerUpScore) : null,
        played_at: playedAt || null,
      })
      setChampionId('')
      setRunnerUpId('')
      setEdition('')
      setChampionScore('')
      setRunnerUpScore('')
      setPlayedAt('')
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao registrar a final.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Registrar final">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Campeão</label>
          <Select required value={championId} onChange={(e) => setChampionId(e.target.value)}>
            <option value="" disabled>
              Selecione o time
            </option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Vice-campeão</label>
          <Select required value={runnerUpId} onChange={(e) => setRunnerUpId(e.target.value)}>
            <option value="" disabled>
              Selecione o time
            </option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Edição</label>
          <Input value={edition} onChange={(e) => setEdition(e.target.value)} placeholder="Ex: 2026 (opcional)" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">Placar campeão</label>
            <Input type="number" min={0} value={championScore} onChange={(e) => setChampionScore(e.target.value)} placeholder="Opcional" />
          </div>
          <span className="mt-5 text-slate-400">x</span>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">Placar vice</label>
            <Input type="number" min={0} value={runnerUpScore} onChange={(e) => setRunnerUpScore(e.target.value)} placeholder="Opcional" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Data</label>
          <Input type="date" value={playedAt} onChange={(e) => setPlayedAt(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? 'Salvando...' : 'Registrar final'}
        </Button>
      </form>
    </Modal>
  )
}
