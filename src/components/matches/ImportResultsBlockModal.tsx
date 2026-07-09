import { useState } from 'react'
import type { Team } from '../../types/database'
import { parseResultsBlockText, type ParsedResult } from '../../utils/parseResultsBlockText'
import { resolveTeamId } from '../../utils/resolveTeamName'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'

type Step = 'paste' | 'review'

export function ImportResultsBlockModal({
  open,
  onClose,
  teams,
  onApply,
}: {
  open: boolean
  onClose: () => void
  teams: Team[]
  onApply: (
    results: {
      round: number
      home_team_id: string
      away_team_id: string
      home_score: number
      away_score: number
      penalty_winner_team_id: string | null
    }[]
  ) => Promise<void>
}) {
  const [step, setStep] = useState<Step>('paste')
  const [text, setText] = useState('')
  const [results, setResults] = useState<ParsedResult[]>([])
  const [manualMap, setManualMap] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function resetState() {
    setStep('paste')
    setText('')
    setResults([])
    setManualMap({})
    setError('')
  }

  function handleClose() {
    resetState()
    onClose()
  }

  function handleParse() {
    const parsed = parseResultsBlockText(text)
    if (parsed.length === 0) {
      setError('Não encontrei resultados no formato "Time A 2 x 1 Time B" depois de uma linha "RODADA N".')
      return
    }
    setError('')
    setResults(parsed)
    setStep('review')
  }

  function nameToTeamId(name: string): string | null {
    return manualMap[name] ?? resolveTeamId(name, teams)
  }

  const rawNames = [...new Set(results.flatMap((r) => [r.homeTeamName, r.awayTeamName]))]
  const unresolvedNames = rawNames.filter((name) => !nameToTeamId(name))

  async function handleConfirm() {
    setSaving(true)
    setError('')
    try {
      const entries = results.map((r) => {
        const homeId = nameToTeamId(r.homeTeamName)!
        const awayId = nameToTeamId(r.awayTeamName)!
        const penaltyWinnerId = r.penaltyWinnerName
          ? nameToTeamId(r.penaltyWinnerName)
          : null
        return {
          round: r.round,
          home_team_id: homeId,
          away_team_id: awayId,
          home_score: r.homeScore,
          away_score: r.awayScore,
          penalty_winner_team_id: penaltyWinnerId,
        }
      })
      await onApply(entries)
      handleClose()
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao salvar os resultados.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Colar resultados da rodada">
      {step === 'paste' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-slate-500">
            Cole o texto com os resultados, no formato "RODADA N" seguido de "Time A 2 x 1 Time B" (e opcionalmente
            "Time X venceu nos pênaltis" logo abaixo de um empate).
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-slate-300 p-2 font-mono text-xs"
            placeholder={'RESULTADOS — RODADA 3\nPono 2 x 5 Lamo\nJuno 2 x 2 Dodo\nJuno venceu nos pênaltis\nDescansou: Beto'}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button onClick={handleParse} disabled={!text.trim()}>
            Analisar
          </Button>
        </div>
      )}

      {step === 'review' && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-600">{results.length} resultado(s) encontrado(s).</p>

          {unresolvedNames.length > 0 && (
            <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-800">
                Não reconheci esses nomes — selecione o time correspondente:
              </p>
              {unresolvedNames.map((name) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="w-24 truncate text-sm text-slate-700">{name}</span>
                  <Select
                    value={manualMap[name] ?? ''}
                    onChange={(e) => setManualMap((prev) => ({ ...prev, [name]: e.target.value }))}
                  >
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
              ))}
            </div>
          )}

          <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200">
            <ul className="divide-y divide-slate-100 text-sm">
              {results.map((r, i) => (
                <li key={i} className="flex flex-col px-3 py-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">R{r.round}</span>
                    <span className="text-slate-700">
                      {r.homeTeamName} {r.homeScore} x {r.awayScore} {r.awayTeamName}
                    </span>
                  </div>
                  {r.penaltyWinnerName && (
                    <span className="text-right text-xs text-amber-600">{r.penaltyWinnerName} venceu nos pênaltis</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button onClick={handleConfirm} disabled={saving || unresolvedNames.length > 0}>
            {saving ? 'Salvando...' : `Confirmar ${results.length} resultado(s)`}
          </Button>
        </div>
      )}
    </Modal>
  )
}
