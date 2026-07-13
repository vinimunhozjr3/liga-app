import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { RoundNews } from '../types/database'

export function useLatestRoundNews(competitionId: string | undefined) {
  const [news, setNews] = useState<RoundNews | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!competitionId) {
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('round_news')
      .select('*')
      .eq('competition_id', competitionId)
      .order('round', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setNews(data as RoundNews | null)
        setLoading(false)
      })
  }, [competitionId])

  return { news, loading }
}
