import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { TeamTitle } from '../types/database'

export function useTeamTitles(competitionId: string | undefined) {
  const [titles, setTitles] = useState<TeamTitle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!competitionId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('team_titles')
      .select('*')
      .eq('competition_id', competitionId)
    if (error) setError(error.message)
    else setTitles(data as TeamTitle[])
    setLoading(false)
  }, [competitionId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function setTitleCount(teamId: string, count: number) {
    if (!competitionId) return
    const safeCount = Math.max(0, count)
    const { error } = await supabase
      .from('team_titles')
      .upsert(
        { competition_id: competitionId, team_id: teamId, titles_count: safeCount },
        { onConflict: 'competition_id,team_id' }
      )
    if (error) throw error
    await refresh()
  }

  function countFor(teamId: string) {
    return titles.find((t) => t.team_id === teamId)?.titles_count ?? 0
  }

  return { titles, loading, error, refresh, setTitleCount, countFor }
}
