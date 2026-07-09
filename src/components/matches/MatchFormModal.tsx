import { useEffect, useState, type FormEvent } from 'react'
import type { Team } from '../../types/database'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'

export function MatchFormModal({
  open,
  onClose,
  teams,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  teams: Team[]
  onSubmit: (input: {
    home_team_id: string
    away_team_id: string
    home_score: number
    away_score: number
    penalty_winner_team_id: string | null
    match_date: string | null
    round: number | null
  }) => Promise<void>
}) {
  const [homeTeamId, setHomeTeamId] = useState('')
  const [awayTeamId, setAwayTeamId] = useState('')
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [penaltyWinnerId, setPenaltyWinnerId] = useState('')
  const [matchDate, setMatchDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [round, setRound] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isDraw = homeScore !== '' && awayScore !== '' && Number(homeScore) === Number(awayScore)

  useEffect(() => {
    if (!isDraw) setPenaltyWinnerId('')
  }, [isDraw])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (homeTeamId === awayTeamId) {
      setError('Mandante e visitante precisam ser times diferentes.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSubmit({
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        home_score: Number(homeScore),
        away_score: Number(awayScore),
        penalty_winner_team_id: isDraw && penaltyWinnerId ? penaltyWinnerId : null,
        match_date: matchDate || null,
        round: round ? Number(round) : null,
      })
      setHomeTeamId('')
      setAwayTeamId('')
      setHomeScore('')
      setAwayScore('')
      setPenaltyWinnerId('')
      setRound('')
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao salvar o placar.'))
    } finally {
      setSaving(false)
    }
  }

  const homeTeam = teams.find((t) => t.id === homeTeamId)
  const awayTeam = teams.find((t) => t.id === awayTeamId)

  return (
    <Modal open={open} onClose={onClose} title="Lançar placar">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mandante</label>
          <Select required value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)}>
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
          <label className="mb-1 block text-sm font-medium text-slate-700">Visitante</label>
          <Select required value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)}>
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
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">Gols mandante</label>
            <Input required type="number" min={0} value={homeScore} onChange={(e) => setHomeScore(e.target.value)} />
          </div>
          <span className="mt-5 text-slate-400">x</span>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">Gols visitante</label>
            <Input required type="number" min={0} value={awayScore} onChange={(e) => setAwayScore(e.target.value)} />
          </div>
        </div>

        {isDraw && homeTeam && awayTeam && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <label className="mb-2 block text-sm font-medium text-amber-800">
              Empatou — quem venceu nos pênaltis?
            </label>
            <div className="flex gap-2">
              {[homeTeam, awayTeam].map((team) => (
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
            <p className="mt-2 text-xs text-amber-700">
              O placar continua valendo como empate (1 ponto pra cada); o vencedor dos pênaltis só é usado como
              critério de desempate na tabela.
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">Data</label>
            <Input type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">Rodada</label>
            <Input type="number" min={1} value={round} onChange={(e) => setRound(e.target.value)} placeholder="Opcional" />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={saving || teams.length < 2}>
          {saving ? 'Salvando...' : 'Salvar placar'}
        </Button>
        {teams.length < 2 && (
          <p className="text-xs text-amber-600">Adicione pelo menos 2 times à competição antes de lançar jogos.</p>
        )}
      </form>
    </Modal>
  )
}
