import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { StandingsRow } from '../types/database'

export function useStandings(competitionId: string | undefined) {
  const [standings, setStandings] = useState<StandingsRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!competitionId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('standings')
      .select('*')
      .eq('competition_id', competitionId)
      .order('position', { ascending: true })
    if (error) setError(error.message)
    else setStandings(data as StandingsRow[])
    setLoading(false)
  }, [competitionId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { standings, loading, error, refresh }
}
