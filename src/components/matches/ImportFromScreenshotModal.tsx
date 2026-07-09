import { useState } from 'react'
import type { MatchRow } from '../../hooks/useMatches'
import { useMatchScreenshotImport, type LineupExtraction, type GoalsExtraction } from '../../hooks/useMatchScreenshotImport'
import { useMatchLineup } from '../../hooks/useMatchLineup'
import { useMatchGoals } from '../../hooks/useMatchGoals'
import type { ScreenshotKind } from '../../types/database'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { Modal } from '../ui/Modal'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { LineupReviewForm, type LineupRowDraft } from './LineupReviewForm'
import { GoalsReviewForm, type GoalRowDraft } from './GoalsReviewForm'

type Step = 'setup' | 'loading' | 'review'
type Side = 'home' | 'away'

function formatMatchLabel(match: MatchRow) {
  const date = match.match_date ? new Date(match.match_date + 'T00:00:00').toLocaleDateString('pt-BR') : ''
  return `${match.home_team.name} ${match.home_score} x ${match.away_score} ${match.away_team.name}${date ? ` — ${date}` : ''}`
}

export function ImportFromScreenshotModal({
  open,
  onClose,
  matches,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  matches: MatchRow[]
  onSaved: () => void
}) {
  const [step, setStep] = useState<Step>('setup')
  const [matchId, setMatchId] = useState('')
  const [kind, setKind] = useState<ScreenshotKind>('lineup')
  const [file, setFile] = useState<File | null>(null)
  const [leftSide, setLeftSide] = useState<Side>('home')
  const [blackSide, setBlackSide] = useState<Side>('home')
  const [error, setError] = useState('')
  const [screenshotId, setScreenshotId] = useState('')
  const [saving, setSaving] = useState(false)

  const [homeRows, setHomeRows] = useState<LineupRowDraft[]>([])
  const [awayRows, setAwayRows] = useState<LineupRowDraft[]>([])
  const [goalRows, setGoalRows] = useState<GoalRowDraft[]>([])

  const { uploadAndExtract } = useMatchScreenshotImport()
  const { saveLineup } = useMatchLineup(matchId || undefined)
  const { saveGoals } = useMatchGoals(matchId || undefined)

  const playedMatches = matches.filter((m) => m.status === 'played')
  const selectedMatch = playedMatches.find((m) => m.id === matchId) ?? null

  function resetState() {
    setStep('setup')
    setMatchId('')
    setKind('lineup')
    setFile(null)
    setLeftSide('home')
    setBlackSide('home')
    setError('')
    setScreenshotId('')
    setHomeRows([])
    setAwayRows([])
    setGoalRows([])
  }

  function handleClose() {
    resetState()
    onClose()
  }

  async function handleExtract() {
    if (!file || !selectedMatch) return
    setStep('loading')
    setError('')
    try {
      const { screenshotId, extraction } = await uploadAndExtract({ matchId: selectedMatch.id, kind, file })
      setScreenshotId(screenshotId)

      if (kind === 'lineup') {
        const ext = extraction as LineupExtraction
        const toRows = (list: LineupExtraction['left']): LineupRowDraft[] =>
          list.map((p) => ({ player_name: p.name, position: p.position, is_legend: p.is_legend }))
        if (leftSide === 'home') {
          setHomeRows(toRows(ext.left))
          setAwayRows(toRows(ext.right))
        } else {
          setHomeRows(toRows(ext.right))
          setAwayRows(toRows(ext.left))
        }
      } else {
        const ext = extraction as GoalsExtraction
        setGoalRows(
          ext.goals.map((g) => {
            const isBlack = g.color === 'black'
            const isHome = isBlack ? blackSide === 'home' : blackSide === 'away'
            return {
              team_id: isHome ? selectedMatch.home_team_id : selectedMatch.away_team_id,
              player_name: g.scorer_name,
              minute: g.minute != null ? String(g.minute) : '',
            }
          })
        )
      }
      setStep('review')
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao extrair dados do print.'))
      setStep('setup')
    }
  }

  async function handleSave() {
    if (!selectedMatch) return
    setSaving(true)
    setError('')
    try {
      if (kind === 'lineup') {
        await saveLineup(screenshotId, [
          ...homeRows.map((r) => ({ ...r, team_id: selectedMatch.home_team_id })),
          ...awayRows.map((r) => ({ ...r, team_id: selectedMatch.away_team_id })),
        ])
      } else {
        await saveGoals(
          screenshotId,
          goalRows.map((r) => ({
            team_id: r.team_id,
            player_name: r.player_name,
            minute: r.minute ? Number(r.minute) : null,
          }))
        )
      }
      onSaved()
      handleClose()
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao salvar os dados.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Importar de print">
      {step === 'setup' && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Partida</label>
            <Select value={matchId} onChange={(e) => setMatchId(e.target.value)}>
              <option value="" disabled>
                Selecione a partida
              </option>
              {playedMatches.map((m) => (
                <option key={m.id} value={m.id}>
                  {formatMatchLabel(m)}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tipo de print</label>
            <div className="flex gap-2">
              {(
                [
                  ['lineup', 'Escalação'],
                  ['goals', 'Gols'],
                ] as [ScreenshotKind, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setKind(value)}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-sm font-medium ${
                    kind === value
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Print</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600"
            />
          </div>

          {selectedMatch && kind === 'lineup' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">A coluna da esquerda no print é:</label>
              <Select value={leftSide} onChange={(e) => setLeftSide(e.target.value as Side)}>
                <option value="home">{selectedMatch.home_team.name} (mandante)</option>
                <option value="away">{selectedMatch.away_team.name} (visitante)</option>
              </Select>
            </div>
          )}

          {selectedMatch && kind === 'goals' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">A cor preta no print é:</label>
              <Select value={blackSide} onChange={(e) => setBlackSide(e.target.value as Side)}>
                <option value="home">{selectedMatch.home_team.name} (mandante)</option>
                <option value="away">{selectedMatch.away_team.name} (visitante)</option>
              </Select>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button onClick={handleExtract} disabled={!selectedMatch || !file}>
            Extrair dados do print
          </Button>
        </div>
      )}

      {step === 'loading' && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Spinner />
          <p className="text-sm text-slate-500">Lendo o print...</p>
        </div>
      )}

      {step === 'review' && selectedMatch && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-500">Confira e corrija antes de salvar.</p>
          {kind === 'lineup' ? (
            <LineupReviewForm
              homeTeam={selectedMatch.home_team}
              awayTeam={selectedMatch.away_team}
              homeRows={homeRows}
              awayRows={awayRows}
              onChangeHome={setHomeRows}
              onChangeAway={setAwayRows}
            />
          ) : (
            <GoalsReviewForm
              homeTeam={selectedMatch.home_team}
              awayTeam={selectedMatch.away_team}
              rows={goalRows}
              onChange={setGoalRows}
            />
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      )}
    </Modal>
  )
}
