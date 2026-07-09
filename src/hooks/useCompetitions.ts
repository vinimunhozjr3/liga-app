import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Competition, CompetitionType, Zone } from '../types/database'

export function useCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setCompetitions(data as Competition[])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createCompetition(input: {
    name: string
    type: CompetitionType
    season: string | null
    zones_config?: Zone[]
  }) {
    const { data, error } = await supabase
      .from('competitions')
      .insert({
        name: input.name,
        type: input.type,
        season: input.season,
        zones_config: input.zones_config ?? [],
      })
      .select('*')
      .single()
    if (error) throw error
    await refresh()
    return data as Competition
  }

  return { competitions, loading, error, refresh, createCompetition }
}

export function useCompetition(competitionId: string | undefined) {
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!competitionId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', competitionId)
      .single()
    if (error) setError(error.message)
    else setCompetition(data as Competition)
    setLoading(false)
  }, [competitionId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function updateCompetition(patch: Partial<Pick<Competition, 'name' | 'season' | 'zones_config'>>) {
    if (!competitionId) return
    const { error } = await supabase.from('competitions').update(patch).eq('id', competitionId)
    if (error) throw error
    await refresh()
  }

  return { competition, loading, error, refresh, updateCompetition }
}
