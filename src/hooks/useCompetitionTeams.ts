import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Team } from '../types/database'

interface CompetitionTeamRow {
  id: string
  team_id: string
  teams: Team
}

export function useCompetitionTeams(competitionId: string | undefined) {
  const [rows, setRows] = useState<CompetitionTeamRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!competitionId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('competition_teams')
      .select('id, team_id, teams (*)')
      .eq('competition_id', competitionId)
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    else setRows(data as unknown as CompetitionTeamRow[])
    setLoading(false)
  }, [competitionId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addTeam(teamId: string) {
    if (!competitionId) return
    const { error } = await supabase
      .from('competition_teams')
      .insert({ competition_id: competitionId, team_id: teamId })
    if (error) throw error
    await refresh()
  }

  async function removeTeam(competitionTeamId: string) {
    const { error } = await supabase.from('competition_teams').delete().eq('id', competitionTeamId)
    if (error) throw error
    await refresh()
  }

  const teams = rows.map((r) => r.teams)

  return { rows, teams, loading, error, refresh, addTeam, removeTeam }
}
