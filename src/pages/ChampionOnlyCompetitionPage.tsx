import { useState } from 'react'
import type { Competition } from '../types/database'
import { useCompetitionTeams } from '../hooks/useCompetitionTeams'
import { useTeamTitles } from '../hooks/useTeamTitles'
import { useTeams } from '../hooks/useTeams'
import { useFinals } from '../hooks/useFinals'
import { useChampionStats } from '../hooks/useChampionStats'
import { useAuth } from '../hooks/useAuth'
import { CompetitionHeader } from '../components/competitions/CompetitionHeader'
import { ChampionsRanking } from '../components/champions/ChampionsRanking'
import { RecordFinalModal } from '../components/champions/RecordFinalModal'
import { FinalsHistoryList } from '../components/champions/FinalsHistoryList'
import { AddTeamToCompetitionModal } from '../components/teams/AddTeamToCompetitionModal'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'

export function ChampionOnlyCompetitionPage({ competition }: { competition: Competition }) {
  const { isAdmin } = useAuth()
  const { rows: competitionTeamRows, teams, loading, addTeam } = useCompetitionTeams(competition.id)
  const { loading: titlesLoading, setTitleCount, countFor } = useTeamTitles(competition.id)
  const { teams: allTeams, createTeam } = useTeams()
  const { finals, loading: finalsLoading, recordFinal, deleteFinal, refresh: refreshFinals } = useFinals(competition.id)
  const { loading: statsLoading, statsFor, refresh: refreshStats } = useChampionStats(competition.id)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [finalModalOpen, setFinalModalOpen] = useState(false)

  const busy = loading || titlesLoading || finalsLoading || statsLoading
  const existingTeamIds = new Set(competitionTeamRows.map((r) => r.team_id))

  async function handleRecordFinal(input: Parameters<typeof recordFinal>[0]) {
    await recordFinal(input)
    await refreshStats()
  }

  async function handleDeleteFinal(finalId: string) {
    await deleteFinal(finalId)
    await refreshFinals()
    await refreshStats()
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <CompetitionHeader competition={competition} isAdmin={isAdmin} />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Ranking de campeões</h2>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setFinalModalOpen(true)}>
                Registrar final
              </Button>
              <Button variant="secondary" onClick={() => setAddModalOpen(true)}>
                + Time
              </Button>
            </div>
          )}
        </div>

        {busy ? (
          <div className="flex flex-1 items-center justify-center py-6">
            <Spinner />
          </div>
        ) : teams.length === 0 ? (
          <EmptyState
            title="Nenhum time nessa competição"
            description="Adicione os times que disputam este campeonato para começar a contar os títulos."
            action={isAdmin ? <Button onClick={() => setAddModalOpen(true)}>Adicionar time</Button> : undefined}
          />
        ) : (
          <ChampionsRanking
            rows={teams.map((team) => {
              const stats = statsFor(team.id)
              return {
                team,
                baseTitlesCount: countFor(team.id),
                finalTitlesCount: stats.final_titles,
                runnerUpCount: stats.runner_up_count,
              }
            })}
            onChangeBaseCount={(teamId, newCount) => setTitleCount(teamId, newCount)}
            isAdmin={isAdmin}
          />
        )}
      </div>

      {teams.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Histórico de finais</h2>
          <FinalsHistoryList finals={finals} onDelete={handleDeleteFinal} isAdmin={isAdmin} />
        </div>
      )}

      {isAdmin && (
        <>
          <AddTeamToCompetitionModal
            open={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            allTeams={allTeams}
            existingTeamIds={existingTeamIds}
            onAddExisting={async (teamId) => {
              await addTeam(teamId)
            }}
            onCreateAndAdd={async (input) => {
              const team = await createTeam(input)
              await addTeam(team.id)
            }}
          />

          <RecordFinalModal
            open={finalModalOpen}
            onClose={() => setFinalModalOpen(false)}
            teams={teams}
            onSubmit={handleRecordFinal}
          />
        </>
      )}
    </div>
  )
}
