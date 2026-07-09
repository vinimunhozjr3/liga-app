import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Final, Team } from '../types/database'

interface FinalRow extends Final {
  champion_team: Team
  runner_up_team: Team
}

export function useFinals(competitionId: string | undefined) {
  const [finals, setFinals] = useState<FinalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!competitionId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('finals')
      .select('*, champion_team:champion_team_id (*), runner_up_team:runner_up_team_id (*)')
      .eq('competition_id', competitionId)
      .order('played_at', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setFinals(data as unknown as FinalRow[])
    setLoading(false)
  }, [competitionId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function recordFinal(input: {
    champion_team_id: string
    runner_up_team_id: string
    edition: string | null
    champion_score: number | null
    runner_up_score: number | null
    played_at: string | null
  }) {
    if (!competitionId) return
    const { error } = await supabase.from('finals').insert({ competition_id: competitionId, ...input })
    if (error) throw error
    await refresh()
  }

  async function deleteFinal(finalId: string) {
    const { error } = await supabase.from('finals').delete().eq('id', finalId)
    if (error) throw error
    await refresh()
  }

  return { finals, loading, error, refresh, recordFinal, deleteFinal }
}
