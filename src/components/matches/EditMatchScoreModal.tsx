import { useEffect, useState, type FormEvent } from 'react'
import type { MatchRow } from '../../hooks/useMatches'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { TeamCrest } from '../teams/TeamCrest'

export function EditMatchScoreModal({
  open,
  onClose,
  match,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  match: MatchRow | null
  onSubmit: (input: {
    home_score: number
    away_score: number
    penalty_winner_team_id: string | null
  }) => Promise<void>
}) {
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [penaltyWinnerId, setPenaltyWinnerId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isDraw = homeScore !== '' && awayScore !== '' && Number(homeScore) === Number(awayScore)

  useEffect(() => {
    if (open) {
      setHomeScore('')
      setAwayScore('')
      setPenaltyWinnerId('')
      setError('')
    }
  }, [open, match?.id])

  useEffect(() => {
    if (!isDraw) setPenaltyWinnerId('')
  }, [isDraw])

  if (!match) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSubmit({
        home_score: Number(homeScore),
        away_score: Number(awayScore),
        penalty_winner_team_id: isDraw && penaltyWinnerId ? penaltyWinnerId : null,
      })
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao salvar o placar.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Lançar placar">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center justify-center gap-3 rounded-lg bg-slate-50 p-3">
          <div className="flex flex-1 flex-col items-center gap-1">
            <TeamCrest team={match.home_team} size={32} />
            <span className="text-center text-sm font-medium text-slate-900">{match.home_team.name}</span>
          </div>
          <span className="text-slate-400">x</span>
          <div className="flex flex-1 flex-col items-center gap-1">
            <TeamCrest team={match.away_team} size={32} />
            <span className="text-center text-sm font-medium text-slate-900">{match.away_team.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">Gols mandante</label>
            <Input
              required
              autoFocus
              type="number"
              min={0}
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
            />
          </div>
          <span className="mt-5 text-slate-400">x</span>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">Gols visitante</label>
            <Input required type="number" min={0} value={awayScore} onChange={(e) => setAwayScore(e.target.value)} />
          </div>
        </div>

        {isDraw && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <label className="mb-2 block text-sm font-medium text-amber-800">
              Empatou — quem venceu nos pênaltis?
            </label>
            <div className="flex gap-2">
              {[match.home_team, match.away_team].map((team) => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => setPenaltyWinnerId(team.id)}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-sm font-medium transition-colors ${
                    penaltyWinnerId === team.id
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar placar'}
        </Button>
      </form>
    </Modal>
  )
}
