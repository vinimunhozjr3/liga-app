import { useState } from 'react'
import type { Team } from '../../types/database'
import { parseCalendarText, type ParsedCalendarMatch } from '../../utils/parseCalendarText'
import { resolveTeamId } from '../../utils/resolveTeamName'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'

type Step = 'paste' | 'review'

export function ImportCalendarModal({
  open,
  onClose,
  teams,
  onSchedule,
}: {
  open: boolean
  onClose: () => void
  teams: Team[]
  onSchedule: (entries: { home_team_id: string; away_team_id: string; round: number }[]) => Promise<void>
}) {
  const [step, setStep] = useState<Step>('paste')
  const [text, setText] = useState('')
  const [matches, setMatches] = useState<ParsedCalendarMatch[]>([])
  const [manualMap, setManualMap] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function resetState() {
    setStep('paste')
    setText('')
    setMatches([])
    setManualMap({})
    setError('')
  }

  function handleClose() {
    resetState()
    onClose()
  }

  function handleParse() {
    const parsed = parseCalendarText(text)
    if (parsed.matches.length === 0) {
      setError('Não encontrei nenhum confronto no formato "Time A x Time B" depois de uma linha "Rodada N".')
      return
    }
    setError('')
    setMatches(parsed.matches)
    setStep('review')
  }

  function nameToTeamId(name: string): string | null {
    return manualMap[name] ?? resolveTeamId(name, teams)
  }

  const rawNames = [...new Set(matches.flatMap((m) => [m.homeTeamName, m.awayTeamName]))]
  const unresolvedNames = rawNames.filter((name) => !nameToTeamId(name))

  async function handleConfirm() {
    setSaving(true)
    setError('')
    try {
      const entries = matches.map((m) => ({
        home_team_id: nameToTeamId(m.homeTeamName)!,
        away_team_id: nameToTeamId(m.awayTeamName)!,
        round: m.round,
      }))
      await onSchedule(entries)
      handleClose()
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao criar os jogos.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Importar calendário">
      {step === 'paste' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-slate-500">
            Cole a lista de times (um por linha) e os confrontos por rodada, no formato "Time A x Time B".
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-slate-300 p-2 font-mono text-xs"
            placeholder={'Vito\nJuno\n...\nRodada 1\nVito x Juno\n...\nDescansa: Pono'}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button onClick={handleParse} disabled={!text.trim()}>
            Analisar
          </Button>
        </div>
      )}

      {step === 'review' && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-600">{matches.length} jogos encontrados, em {[...new Set(matches.map((m) => m.round))].length} rodada(s).</p>

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
              {matches.map((m, i) => (
                <li key={i} className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-slate-400">R{m.round}</span>
                  <span className="text-slate-700">
                    {m.homeTeamName} x {m.awayTeamName}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button onClick={handleConfirm} disabled={saving || unresolvedNames.length > 0}>
            {saving ? 'Criando...' : `Confirmar e criar ${matches.length} jogos`}
          </Button>
        </div>
      )}
    </Modal>
  )
}
