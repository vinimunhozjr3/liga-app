import { useParams } from 'react-router-dom'
import { useCompetition } from '../hooks/useCompetitions'
import { LeagueTableCompetitionPage } from './LeagueTableCompetitionPage'
import { ChampionOnlyCompetitionPage } from './ChampionOnlyCompetitionPage'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'

export function CompetitionRouter() {
  const { id } = useParams<{ id: string }>()
  const { competition, loading } = useCompetition(id)

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="p-4">
        <EmptyState title="Campeonato não encontrado" />
      </div>
    )
  }

  return competition.type === 'league_table' ? (
    <LeagueTableCompetitionPage competition={competition} />
  ) : (
    <ChampionOnlyCompetitionPage competition={competition} />
  )
}
