import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { usePlayers } from './usePlayers'
import type { MatchGoal, Player } from '../types/database'

interface MatchGoalRow extends MatchGoal {
  players: Player
}

export interface GoalDraft {
  team_id: string
  player_name: string
  minute: number | null
}

export function useMatchGoals(matchId: string | undefined) {
  const { findOrCreateByName } = usePlayers()
  const [goals, setGoals] = useState<MatchGoalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!matchId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('match_goals')
      .select('*, players:player_id (*)')
      .eq('match_id', matchId)
      .order('minute', { ascending: true })
    if (error) setError(error.message)
    else setGoals(data as unknown as MatchGoalRow[])
    setLoading(false)
  }, [matchId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function saveGoals(screenshotId: string, drafts: GoalDraft[]) {
    if (!matchId) return
    const rows = await Promise.all(
      drafts.map(async (draft) => {
        const player = await findOrCreateByName(draft.player_name)
        return {
          match_id: matchId,
          team_id: draft.team_id,
          player_id: player.id,
          minute: draft.minute,
          screenshot_id: screenshotId,
        }
      })
    )
    const { error } = await supabase.from('match_goals').insert(rows)
    if (error) throw error
    await refresh()
  }

  async function deleteGoal(goalId: string) {
    const { error } = await supabase.from('match_goals').delete().eq('id', goalId)
    if (error) throw error
    await refresh()
  }

  return { goals, loading, error, refresh, saveGoals, deleteGoal }
}
