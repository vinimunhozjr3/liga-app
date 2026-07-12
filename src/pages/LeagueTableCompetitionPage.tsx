import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Competition } from '../types/database'
import { useCompetitionTeams } from '../hooks/useCompetitionTeams'
import { useMatches } from '../hooks/useMatches'
import { useStandings } from '../hooks/useStandings'
import { useTeams } from '../hooks/useTeams'
import { usePlayerStats } from '../hooks/usePlayerStats'
import { useAuth } from '../hooks/useAuth'
import { StandingsTable } from '../components/standings/StandingsTable'
import { MatchesTabContent } from '../components/matches/MatchesTabContent'
import { MatchFormModal } from '../components/matches/MatchFormModal'
import { ImportFromScreenshotModal } from '../components/matches/ImportFromScreenshotModal'
import { ImportCalendarModal } from '../components/matches/ImportCalendarModal'
import { ImportResultsBlockModal } from '../components/matches/ImportResultsBlockModal'
import { TeamList } from '../components/teams/TeamList'
import { TeamFormModal } from '../components/teams/TeamFormModal'
import { AddTeamToCompetitionModal } from '../components/teams/AddTeamToCompetitionModal'
import { MostFieldedTable } from '../components/stats/MostFieldedTable'
import { TopScorersTable } from '../components/stats/TopScorersTable'
import { LegendsByTeamTable } from '../components/stats/LegendsByTeamTable'
import { RoundSelectionPanel } from '../components/stats/RoundSelectionPanel'
import { RoundNewsPanel } from '../components/news/RoundNewsPanel'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import type { Team } from '../types/database'

type Tab = 'standings' | 'matches' | 'teams' | 'stats' | 'news'

export function LeagueTableCompetitionPage({ competition }: { competition: Competition }) {
  const { isAdmin } = useAuth()
  const [tab, setTab] = useState<Tab>('standings')

  const { standings, loading: standingsLoading, refresh: refreshStandings } = useStandings(competition.id)
  const { rows: competitionTeamRows, teams, loading: teamsLoading, addTeam, removeTeam } = useCompetitionTeams(
    competition.id
  )
  const {
    matches,
    loading: matchesLoading,
    recordMatch,
    deleteMatch,
    deleteMatches,
    scheduleMatches,
    applyResults,
    refresh: refreshMatches,
  } = useMatches(competition.id)
  const { teams: allTeams, createTeam, updateTeam } = useTeams()
  const { mostFielded, topScorers, legendsByTeam } = usePlayerStats(competition.id)

  const [matchModalOpen, setMatchModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [calendarModalOpen, setCalendarModalOpen] = useState(false)
  const [resultsBlockModalOpen, setResultsBlockModalOpen] = useState(false)
  const [addTeamModalOpen, setAddTeamModalOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)

  const existingTeamIds = new Set(competitionTeamRows.map((r) => r.team_id))
  const rounds = [...new Set(matches.map((m) => m.round).filter((r): r is number => r != null))].sort((a, b) => a - b)
  const playedRounds = [
    ...new Set(matches.filter((m) => m.status === 'played').map((m) => m.round).filter((r): r is number => r != null)),
  ].sort((a, b) => a - b)

  async function handleRecordMatch(input: Parameters<typeof recordMatch>[0]) {
    await recordMatch(input)
    await refreshStandings()
  }

  async function handleDeleteMatch(matchId: string) {
    await deleteMatch(matchId)
    await refreshStandings()
  }

  async function handleDeleteManyMatches(matchIds: string[]) {
    await deleteMatches(matchIds)
    await refreshStandings()
  }

  async function handleDeleteAllMatches() {
    await deleteMatches(matches.map((m) => m.id))
    await refreshStandings()
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{competition.name}</h1>
          {competition.season && <p className="text-xs text-slate-500">{competition.season}</p>}
        </div>
        {isAdmin && (
          <Link to={`/competitions/${competition.id}/settings`} className="text-sm text-slate-500 hover:underline">
            Configurações
          </Link>
        )}
      </div>

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {(
          [
            ['standings', 'Classificação'],
            ['matches', 'Jogos'],
            ['teams', 'Times'],
            ['stats', 'Estatísticas'],
            ['news', 'Notícias'],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'standings' &&
        (standingsLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <StandingsTable standings={standings} zones={competition.zones_config} />
        ))}

      {tab === 'matches' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap justify-end gap-2">
            {isAdmin && (
              <>
                <Button variant="secondary" onClick={() => setCalendarModalOpen(true)}>
                  Importar calendário
                </Button>
                <Button variant="secondary" onClick={() => setResultsBlockModalOpen(true)}>
                  Colar resultados da rodada
                </Button>
                <Button variant="secondary" onClick={() => setImportModalOpen(true)}>
                  Importar de print
                </Button>
              </>
            )}
            <Button onClick={() => setMatchModalOpen(true)}>+ Lançar placar</Button>
          </div>
          {matchesLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <MatchesTabContent
              matches={matches}
              teams={teams}
              onDelete={handleDeleteMatch}
              onDeleteMany={handleDeleteManyMatches}
              onDeleteAll={handleDeleteAllMatches}
              isAdmin={isAdmin}
            />
          )}
        </div>
      )}

      {tab === 'teams' && (
        <div className="flex flex-col gap-3">
          {isAdmin && (
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setAddTeamModalOpen(true)}>
                + Adicionar time
              </Button>
            </div>
          )}
          {teamsLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <TeamList
              teams={teams}
              onEdit={(team) => setEditingTeam(team)}
              onRemove={(team) => {
                const row = competitionTeamRows.find((r) => r.team_id === team.id)
                if (row) removeTeam(row.id)
              }}
              isAdmin={isAdmin}
            />
          )}
        </div>
      )}

      {tab === 'stats' && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Seleção da rodada</h2>
            <RoundSelectionPanel competitionId={competition.id} rounds={rounds} />
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Artilheiros</h2>
            <TopScorersTable rows={topScorers} />
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Mais escalados</h2>
            <MostFieldedTable rows={mostFielded} />
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Times que mais escalam legends</h2>
            <LegendsByTeamTable rows={legendsByTeam} />
          </div>
        </div>
      )}

      {tab === 'news' && (
        <RoundNewsPanel competitionId={competition.id} rounds={playedRounds} allTeams={allTeams} isAdmin={isAdmin} />
      )}

      <MatchFormModal
        open={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        teams={teams}
        onSubmit={handleRecordMatch}
      />

      {isAdmin && (
        <>
          <ImportFromScreenshotModal
            open={importModalOpen}
            onClose={() => setImportModalOpen(false)}
            matches={matches}
            onSaved={refreshStandings}
          />

          <ImportCalendarModal
            open={calendarModalOpen}
            onClose={() => setCalendarModalOpen(false)}
            teams={teams}
            onSchedule={async (entries) => {
              await scheduleMatches(entries)
              await refreshMatches()
            }}
          />

          <ImportResultsBlockModal
            open={resultsBlockModalOpen}
            onClose={() => setResultsBlockModalOpen(false)}
            teams={teams}
            onApply={async (results) => {
              await applyResults(results)
              await refreshStandings()
            }}
          />

          <AddTeamToCompetitionModal
            open={addTeamModalOpen}
            onClose={() => setAddTeamModalOpen(false)}
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

          <TeamFormModal
            open={!!editingTeam}
            onClose={() => setEditingTeam(null)}
            initialTeam={editingTeam}
            onSubmit={async (input) => {
              if (editingTeam) await updateTeam(editingTeam.id, input)
            }}
          />
        </>
      )}
    </div>
  )
}
