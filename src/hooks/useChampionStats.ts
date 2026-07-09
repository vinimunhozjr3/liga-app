import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { ChampionStats } from '../types/database'

export function useChampionStats(competitionId: string | undefined) {
  const [stats, setStats] = useState<ChampionStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!competitionId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('champion_stats')
      .select('*')
      .eq('competition_id', competitionId)
    if (error) setError(error.message)
    else setStats(data as ChampionStats[])
    setLoading(false)
  }, [competitionId])

  useEffect(() => {
    refresh()
  }, [refresh])

  function statsFor(teamId: string) {
    return stats.find((s) => s.team_id === teamId) ?? { final_titles: 0, runner_up_count: 0 }
  }

  return { stats, loading, error, refresh, statsFor }
}
