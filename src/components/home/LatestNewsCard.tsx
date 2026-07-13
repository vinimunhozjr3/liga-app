import { Link } from 'react-router-dom'
import type { Competition } from '../../types/database'
import { useLatestRoundNews } from '../../hooks/useLatestRoundNews'

export function LatestNewsCard({ competition }: { competition: Competition }) {
  const { news, loading } = useLatestRoundNews(competition.id)

  if (loading || !news) return null

  return (
    <Link
      to={`/competitions/${competition.id}?tab=news`}
      className="block rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg leading-none">📰</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          {competition.name} · Rodada {news.round}
        </span>
      </div>
      <h3 className="mb-1 text-base font-extrabold leading-snug text-slate-900">{news.title}</h3>
      <p className="line-clamp-2 text-sm text-slate-600">{news.body}</p>
      <p className="mt-2 text-xs font-semibold text-amber-700">Ler matéria completa →</p>
    </Link>
  )
}
