import { useState, type FormEvent } from 'react'
import type { Team } from '../../types/database'
import type { TeamInput } from '../../hooks/useTeams'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

export function TeamFormModal({
  open,
  onClose,
  onSubmit,
  initialTeam,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (input: TeamInput) => Promise<void>
  initialTeam?: Team | null
}) {
  const [name, setName] = useState(initialTeam?.name ?? '')
  const [coachName, setCoachName] = useState(initialTeam?.coach_name ?? '')
  const [crestUrl, setCrestUrl] = useState(initialTeam?.crest_url ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSubmit({
        name: name.trim(),
        coach_name: coachName.trim() || null,
        crest_url: crestUrl.trim() || null,
      })
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao salvar o time.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initialTeam ? 'Editar time' : 'Novo time'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nome do time</label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Boteco FC" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Técnico</label>
          <Input value={coachName} onChange={(e) => setCoachName(e.target.value)} placeholder="Opcional" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">URL do escudo</label>
          <Input value={crestUrl} onChange={(e) => setCrestUrl(e.target.value)} placeholder="Opcional" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </Modal>
  )
}
