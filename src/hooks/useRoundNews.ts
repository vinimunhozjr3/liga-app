import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { RoundNews } from '../types/database'

export function useRoundNews(competitionId: string | undefined, round: number | null) {
  const [news, setNews] = useState<RoundNews | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!competitionId || round == null) {
      setNews(null)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('round_news')
      .select('*')
      .eq('competition_id', competitionId)
      .eq('round', round)
      .maybeSingle()
    if (error) setError(error.message)
    else setNews(data as RoundNews | null)
    setLoading(false)
  }, [competitionId, round])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function generate() {
    if (!competitionId || round == null) return
    setGenerating(true)
    setError(null)
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-round-news', {
        body: { competition_id: competitionId, round },
      })
      if (fnError) throw fnError
      if (data?.error) throw new Error(data.error)

      const { title, body } = data.result as { title: string; body: string }
      const { error: upsertError } = await supabase
        .from('round_news')
        .upsert({ competition_id: competitionId, round, title, body }, { onConflict: 'competition_id,round' })
      if (upsertError) throw upsertError
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar a notícia.')
      throw err
    } finally {
      setGenerating(false)
    }
  }

  return { news, loading, generating, error, refresh, generate }
}
