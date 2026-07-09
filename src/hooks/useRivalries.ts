import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Rivalry, Team } from '../types/database'

interface RivalryRow extends Rivalry {
  team_a: Team
  team_b: Team | null
}

export function useRivalries() {
  const [rivalries, setRivalries] = useState<RivalryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('rivalries')
      .select('*, team_a:team_a_id (*), team_b:team_b_id (*)')
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    else setRivalries(data as unknown as RivalryRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addRivalry(teamAId: string, teamBId: string | null) {
    const { error } = await supabase.from('rivalries').insert({ team_a_id: teamAId, team_b_id: teamBId })
    if (error) throw error
    await refresh()
  }

  async function deleteRivalry(id: string) {
    const { error } = await supabase.from('rivalries').delete().eq('id', id)
    if (error) throw error
    await refresh()
  }

  return { rivalries, loading, error, refresh, addRivalry, deleteRivalry }
}
