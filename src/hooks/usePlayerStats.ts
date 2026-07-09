import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { PlayerStats } from '../types/database'

export function usePlayerStats(competitionId: string | undefined) {
  const [stats, setStats] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!competitionId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('competition_id', competitionId)
    if (error) setError(error.message)
    else setStats(data as PlayerStats[])
    setLoading(false)
  }, [competitionId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const mostFielded = [...stats].sort((a, b) => b.appearances - a.appearances || a.player_name.localeCompare(b.player_name))

  const topScorers = [...stats]
    .filter((s) => s.goals > 0)
    .sort((a, b) => b.goals - a.goals || a.player_name.localeCompare(b.player_name))

  const legendsByTeam = Object.values(
    stats.reduce<Record<string, { team_id: string; team_name: string; legend_appearances: number }>>((acc, s) => {
      if (!acc[s.team_id]) acc[s.team_id] = { team_id: s.team_id, team_name: s.team_name, legend_appearances: 0 }
      acc[s.team_id].legend_appearances += s.legend_appearances
      return acc
    }, {})
  ).sort((a, b) => b.legend_appearances - a.legend_appearances || a.team_name.localeCompare(b.team_name))

  return { stats, loading, error, refresh, mostFielded, topScorers, legendsByTeam }
}
