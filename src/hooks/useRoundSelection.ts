import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Bucket = 'goleiro' | 'defesa' | 'meio' | 'ataque'

const POSITION_KEYWORDS: Record<Bucket, string[]> = {
  goleiro: ['GOL', 'GK'],
  defesa: ['LD', 'LE', 'ZAG', 'ZE', 'ZD', 'CB', 'LB', 'RB'],
  meio: ['VOL', 'MC', 'MEI', 'MD', 'ME', 'CM', 'DM', 'AM'],
  ataque: ['CA', 'PD', 'PE', 'ATA', 'ST', 'CF', 'RW', 'LW'],
}

function bucketFor(position: string | null): Bucket {
  const p = (position || '').toUpperCase().trim()
  for (const bucket of Object.keys(POSITION_KEYWORDS) as Bucket[]) {
    if (POSITION_KEYWORDS[bucket].some((keyword) => p === keyword || p.startsWith(keyword))) return bucket
  }
  return 'meio'
}

export interface SelectionEntry {
  player_id: string
  player_name: string
  team_id: string
  team_name: string
  position: string | null
  is_legend: boolean
  goals_in_round: number
}

export interface RoundSelection {
  goleiro: SelectionEntry | null
  defesa: SelectionEntry[]
  meio: SelectionEntry[]
  ataque: SelectionEntry[]
}

export function useRoundSelection(competitionId: string | undefined, round: number | null) {
  const [selection, setSelection] = useState<RoundSelection | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!competitionId || round == null) {
      setSelection(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('id, home_team_id, away_team_id, home_score, away_score')
        .eq('competition_id', competitionId)
        .eq('round', round)
        .eq('status', 'played')
      if (matchesError) throw matchesError

      const matchIds = (matches ?? []).map((m) => m.id)
      const goalsAgainstByTeam = new Map<string, number>()
      for (const m of matches ?? []) {
        goalsAgainstByTeam.set(m.home_team_id, m.away_score ?? 0)
        goalsAgainstByTeam.set(m.away_team_id, m.home_score ?? 0)
      }

      if (matchIds.length === 0) {
        setSelection({ goleiro: null, defesa: [], meio: [], ataque: [] })
        return
      }

      const [{ data: lineupRows, error: lineupError }, { data: goalRows, error: goalError }] = await Promise.all([
        supabase
          .from('match_lineup_entries')
          .select('team_id, position, is_legend, player_id, players:player_id (name), teams:team_id (name)')
          .in('match_id', matchIds),
        supabase.from('match_goals').select('player_id, team_id').in('match_id', matchIds),
      ])
      if (lineupError) throw lineupError
      if (goalError) throw goalError

      const goalsCountByPlayer = new Map<string, number>()
      for (const g of goalRows ?? []) {
        goalsCountByPlayer.set(g.player_id, (goalsCountByPlayer.get(g.player_id) ?? 0) + 1)
      }

      type LineupJoinRow = {
        team_id: string
        position: string | null
        is_legend: boolean
        player_id: string
        players: { name: string } | null
        teams: { name: string } | null
      }

      const entries: SelectionEntry[] = ((lineupRows ?? []) as unknown as LineupJoinRow[]).map((row) => ({
        player_id: row.player_id,
        player_name: row.players?.name ?? '?',
        team_id: row.team_id,
        team_name: row.teams?.name ?? '?',
        position: row.position,
        is_legend: row.is_legend,
        goals_in_round: goalsCountByPlayer.get(row.player_id) ?? 0,
      }))

      const byBucket: Record<Bucket, SelectionEntry[]> = { goleiro: [], defesa: [], meio: [], ataque: [] }
      for (const entry of entries) byBucket[bucketFor(entry.position)].push(entry)

      function sortByGoals(list: SelectionEntry[]) {
        return [...list].sort(
          (a, b) =>
            b.goals_in_round - a.goals_in_round ||
            Number(b.is_legend) - Number(a.is_legend) ||
            a.player_name.localeCompare(b.player_name)
        )
      }

      const ataque = sortByGoals(byBucket.ataque).slice(0, 3)
      const meio = sortByGoals(byBucket.meio).slice(0, 3)

      const teamsByDefense = [...goalsAgainstByTeam.entries()].sort((a, b) => a[1] - b[1]).map(([teamId]) => teamId)

      let goleiro: SelectionEntry | null = null
      const defesa: SelectionEntry[] = []
      for (const teamId of teamsByDefense) {
        if (!goleiro) {
          const gk = byBucket.goleiro.find((e) => e.team_id === teamId)
          if (gk) goleiro = gk
        }
        if (defesa.length < 4) {
          const defenders = byBucket.defesa.filter((e) => e.team_id === teamId)
          for (const d of defenders) {
            if (defesa.length < 4) defesa.push(d)
          }
        }
      }

      setSelection({ goleiro, defesa, meio, ataque })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular a seleção da rodada.')
    } finally {
      setLoading(false)
    }
  }, [competitionId, round])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { selection, loading, error, refresh }
}
