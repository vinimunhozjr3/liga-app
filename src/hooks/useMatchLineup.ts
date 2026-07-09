import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { usePlayers } from './usePlayers'
import type { MatchLineupEntry, Player } from '../types/database'

interface LineupEntryRow extends MatchLineupEntry {
  players: Player
}

export interface LineupEntryDraft {
  team_id: string
  player_name: string
  position: string
  is_legend: boolean
}

export function useMatchLineup(matchId: string | undefined) {
  const { findOrCreateByName } = usePlayers()
  const [entries, setEntries] = useState<LineupEntryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!matchId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('match_lineup_entries')
      .select('*, players:player_id (*)')
      .eq('match_id', matchId)
    if (error) setError(error.message)
    else setEntries(data as unknown as LineupEntryRow[])
    setLoading(false)
  }, [matchId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function saveLineup(screenshotId: string, drafts: LineupEntryDraft[]) {
    if (!matchId) return
    const rows = await Promise.all(
      drafts.map(async (draft) => {
        const player = await findOrCreateByName(draft.player_name)
        return {
          match_id: matchId,
          team_id: draft.team_id,
          player_id: player.id,
          position: draft.position.trim() || null,
          is_legend: draft.is_legend,
          screenshot_id: screenshotId,
        }
      })
    )
    const { error } = await supabase.from('match_lineup_entries').insert(rows)
    if (error) throw error
    await refresh()
  }

  async function deleteEntry(entryId: string) {
    const { error } = await supabase.from('match_lineup_entries').delete().eq('id', entryId)
    if (error) throw error
    await refresh()
  }

  return { entries, loading, error, refresh, saveLineup, deleteEntry }
}
