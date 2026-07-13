import { useState } from 'react'
import { useCompetitions } from '../hooks/useCompetitions'
import { useAuth } from '../hooks/useAuth'
import { DEFAULT_ZONES } from '../lib/constants'
import { CompetitionCard } from '../components/competitions/CompetitionCard'
import { CreateCompetitionModal } from '../components/competitions/CreateCompetitionModal'
import { NextMatchCard } from '../components/home/NextMatchCard'
import { LatestNewsCard } from '../components/home/LatestNewsCard'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'

export function HomePage() {
  const { competitions, loading, createCompetition } = useCompetitions()
  const { isAdmin } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-slate-900">Campeonatos</h1>
        {isAdmin && <Button onClick={() => setModalOpen(true)}>+ Novo</Button>}
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : competitions.length === 0 ? (
        <EmptyState
          title="Nenhum campeonato ainda"
          description="Crie o primeiro campeonato do grupo, tipo Brasileirão ou Copa do Brasil."
          action={isAdmin ? <Button onClick={() => setModalOpen(true)}>Criar campeonato</Button> : undefined}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {competitions.map((c) => (
            <CompetitionCard key={c.id} competition={c} />
          ))}
        </div>
      )}

      {!loading && competitions.length > 0 && (
        <div className="flex flex-col gap-3">
          {competitions
            .filter((c) => c.type === 'league_table')
            .map((c) => (
              <NextMatchCard key={c.id} competition={c} />
            ))}
          {competitions
            .filter((c) => c.type === 'league_table')
            .map((c) => (
              <LatestNewsCard key={c.id} competition={c} />
            ))}
        </div>
      )}

      {isAdmin && (
        <CreateCompetitionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={async ({ name, type, season }) => {
            await createCompetition({
              name,
              type,
              season,
              zones_config: type === 'league_table' ? DEFAULT_ZONES : [],
            })
          }}
        />
      )}
    </div>
  )
}
