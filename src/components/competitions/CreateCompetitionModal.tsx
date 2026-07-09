import { useState, type FormEvent } from 'react'
import type { CompetitionType } from '../../types/database'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'

export function CreateCompetitionModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (input: { name: string; type: CompetitionType; season: string | null }) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<CompetitionType>('league_table')
  const [season, setSeason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onCreate({ name: name.trim(), type, season: season.trim() || null })
      setName('')
      setSeason('')
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao criar o campeonato.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Novo campeonato">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Campeonato Brasileiro" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Temporada</label>
          <Input value={season} onChange={(e) => setSeason(e.target.value)} placeholder="2026 (opcional)" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Tipo</label>
          <Select value={type} onChange={(e) => setType(e.target.value as CompetitionType)}>
            <option value="league_table">Tabela (pontos corridos, com placares)</option>
            <option value="champion_only">Somente campeão (só contagem de títulos)</option>
          </Select>
          {type === 'league_table' && (
            <p className="mt-1 text-xs text-slate-500">
              Já cria com as zonas coloridas padrão do Brasileirão (dá pra editar depois em Configurações).
            </p>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? 'Criando...' : 'Criar campeonato'}
        </Button>
      </form>
    </Modal>
  )
}
