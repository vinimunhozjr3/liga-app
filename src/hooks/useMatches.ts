import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Match, MatchStatus, Team } from '../types/database'

export interface MatchRow extends Match {
  home_team: Team
  away_team: Team
}

export function useMatches(competitionId: string | undefined) {
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!competitionId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('matches')
      .select('*, home_team:home_team_id (*), away_team:away_team_id (*)')
      .eq('competition_id', competitionId)
      .order('match_date', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setMatches(data as unknown as MatchRow[])
    setLoading(false)
  }, [competitionId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function recordMatch(input: {
    home_team_id: string
    away_team_id: string
    home_score: number
    away_score: number
    penalty_winner_team_id: string | null
    match_date: string | null
    round: number | null
  }) {
    if (!competitionId) return
    const { error } = await supabase.from('matches').insert({
      competition_id: competitionId,
      status: 'played',
      ...input,
    })
    if (error) throw error
    await refresh()
  }

  async function updateMatch(
    matchId: string,
    patch: Partial<{
      home_score: number
      away_score: number
      penalty_winner_team_id: string | null
      match_date: string | null
      round: number | null
      status: MatchStatus
    }>
  ) {
    const { error } = await supabase.from('matches').update(patch).eq('id', matchId)
    if (error) throw error
    await refresh()
  }

  async function deleteMatch(matchId: string) {
    const { error } = await supabase.from('matches').delete().eq('id', matchId)
    if (error) throw error
    await refresh()
  }

  async function scheduleMatches(
    entries: { home_team_id: string; away_team_id: string; round: number }[]
  ) {
    if (!competitionId || entries.length === 0) return
    const rows = entries.map((entry) => ({
      competition_id: competitionId,
      status: 'scheduled' as const,
      home_team_id: entry.home_team_id,
      away_team_id: entry.away_team_id,
      round: entry.round,
    }))
    const { error } = await supabase.from('matches').insert(rows)
    if (error) throw error
    await refresh()
  }

  async function applyResults(
    results: {
      round: number
      home_team_id: string
      away_team_id: string
      home_score: number
      away_score: number
      penalty_winner_team_id: string | null
    }[]
  ) {
    if (!competitionId) return
    for (const r of results) {
      const existing = matches.find(
        (m) =>
          m.round === r.round &&
          m.status === 'scheduled' &&
          ((m.home_team_id === r.home_team_id && m.away_team_id === r.away_team_id) ||
            (m.home_team_id === r.away_team_id && m.away_team_id === r.home_team_id))
      )
      if (existing) {
        const flipped = existing.home_team_id === r.away_team_id
        const { error } = await supabase
          .from('matches')
          .update({
            home_score: flipped ? r.away_score : r.home_score,
            away_score: flipped ? r.home_score : r.away_score,
            penalty_winner_team_id: r.penalty_winner_team_id,
            status: 'played',
          })
          .eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('matches').insert({
          competition_id: competitionId,
          status: 'played',
          home_team_id: r.home_team_id,
          away_team_id: r.away_team_id,
          home_score: r.home_score,
          away_score: r.away_score,
          penalty_winner_team_id: r.penalty_winner_team_id,
          round: r.round,
        })
        if (error) throw error
      }
    }
    await refresh()
  }

  return { matches, loading, error, refresh, recordMatch, updateMatch, deleteMatch, scheduleMatches, applyResults }
}
