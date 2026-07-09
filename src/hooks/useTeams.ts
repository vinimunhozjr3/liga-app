import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Team } from '../types/database'

export interface TeamInput {
  name: string
  coach_name: string | null
  crest_url: string | null
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('teams').select('*').order('name', { ascending: true })
    if (error) setError(error.message)
    else setTeams(data as Team[])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createTeam(input: TeamInput) {
    const { data, error } = await supabase.from('teams').insert(input).select('*').single()
    if (error) throw error
    await refresh()
    return data as Team
  }

  async function updateTeam(teamId: string, patch: Partial<TeamInput>) {
    const { error } = await supabase.from('teams').update(patch).eq('id', teamId)
    if (error) throw error
    await refresh()
  }

  return { teams, loading, error, refresh, createTeam, updateTeam }
}
