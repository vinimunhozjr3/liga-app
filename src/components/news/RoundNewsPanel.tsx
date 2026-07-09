import { useState } from 'react'
import type { Team } from '../../types/database'
import { useRoundNews } from '../../hooks/useRoundNews'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { NewsArticle } from './NewsArticle'
import { ManageRivalriesModal } from '../rivalries/ManageRivalriesModal'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../ui/EmptyState'

export function RoundNewsPanel({
  competitionId,
  rounds,
  allTeams,
}: {
  competitionId: string
  rounds: number[]
  allTeams: Team[]
}) {
  const [round, setRound] = useState<number | null>(rounds[0] ?? null)
  const [rivalriesOpen, setRivalriesOpen] = useState(false)
  const [error, setError] = useState('')
  const { news, loading, generating, generate } = useRoundNews(competitionId, round)

  async function handleGenerate() {
    setError('')
    try {
      await generate()
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao gerar a notícia.'))
    }
  }

  if (rounds.length === 0) {
    return <EmptyState title="Nenhuma rodada com jogos lançados ainda" />
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Notícia da rodada, escrita por IA no maior climão de zoeira.</p>
        <button onClick={() => setRivalriesOpen(true)} className="text-xs text-slate-500 hover:underline">
          Gerenciar rivalidades
        </button>
      </div>

      <Select value={round ?? ''} onChange={(e) => setRound(Number(e.target.value))}>
        {rounds.map((r) => (
          <option key={r} value={r}>
            Rodada {r}
          </option>
        ))}
      </Select>

      {loading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : (
        <>
          {news && <NewsArticle news={news} />}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button onClick={handleGenerate} disabled={generating} variant={news ? 'secondary' : 'primary'}>
            {generating ? 'Gerando...' : news ? 'Gerar de novo' : 'Gerar notícia'}
          </Button>
        </>
      )}

      <ManageRivalriesModal open={rivalriesOpen} onClose={() => setRivalriesOpen(false)} teams={allTeams} />
    </div>
  )
}
