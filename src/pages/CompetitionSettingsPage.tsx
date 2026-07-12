import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useCompetition } from '../hooks/useCompetitions'
import { useAuth } from '../hooks/useAuth'
import type { Zone } from '../types/database'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

export function CompetitionSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin, loading: authLoading } = useAuth()
  const { competition, loading, updateCompetition } = useCompetition(id)

  if (!authLoading && !isAdmin) {
    return <Navigate to={id ? `/competitions/${id}` : '/'} replace />
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Link to={id ? `/competitions/${id}` : '/'} className="text-sm text-slate-500 hover:underline">
          ← Voltar
        </Link>
      </div>

      {loading || !competition ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <SettingsForm
          name={competition.name}
          season={competition.season}
          zones={competition.zones_config}
          isLeagueTable={competition.type === 'league_table'}
          onSave={async (patch) => {
            await updateCompetition(patch)
            navigate(`/competitions/${id}`)
          }}
        />
      )}
    </div>
  )
}

function SettingsForm({
  name: initialName,
  season: initialSeason,
  zones: initialZones,
  isLeagueTable,
  onSave,
}: {
  name: string
  season: string | null
  zones: Zone[]
  isLeagueTable: boolean
  onSave: (patch: { name: string; season: string | null; zones_config: Zone[] }) => Promise<void>
}) {
  const [name, setName] = useState(initialName)
  const [season, setSeason] = useState(initialSeason ?? '')
  const [zones, setZones] = useState<Zone[]>(initialZones)
  const [saving, setSaving] = useState(false)

  function updateZone(index: number, patch: Partial<Zone>) {
    setZones((prev) => prev.map((z, i) => (i === index ? { ...z, ...patch } : z)))
  }

  function removeZone(index: number) {
    setZones((prev) => prev.filter((_, i) => i !== index))
  }

  function addZone() {
    setZones((prev) => [...prev, { label: 'Nova zona', color: '#64748b', from_position: 1, to_position: 1 }])
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({ name: name.trim(), season: season.trim() || null, zones_config: zones })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
        <Input required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Temporada</label>
        <Input value={season} onChange={(e) => setSeason(e.target.value)} placeholder="Opcional" />
      </div>

      {isLeagueTable && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Zonas coloridas da tabela</label>
            <Button type="button" variant="ghost" onClick={addZone}>
              + Zona
            </Button>
          </div>
          {zones.map((zone, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2">
              <input
                type="color"
                value={zone.color}
                onChange={(e) => updateZone(i, { color: e.target.value })}
                className="h-8 w-8 shrink-0 cursor-pointer rounded"
              />
              <Input
                className="flex-1"
                value={zone.label}
                onChange={(e) => updateZone(i, { label: e.target.value })}
                placeholder="Nome da zona"
              />
              <Input
                className="w-16"
                type="number"
                min={1}
                value={zone.from_position}
                onChange={(e) => updateZone(i, { from_position: Number(e.target.value) })}
              />
              <span className="text-slate-400">–</span>
              <Input
                className="w-16"
                type="number"
                min={1}
                value={zone.to_position}
                onChange={(e) => updateZone(i, { to_position: Number(e.target.value) })}
              />
              <button
                type="button"
                onClick={() => removeZone(i)}
                className="text-slate-400 hover:text-red-600"
                aria-label="Remover zona"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar configurações'}
      </Button>
    </form>
  )
}
