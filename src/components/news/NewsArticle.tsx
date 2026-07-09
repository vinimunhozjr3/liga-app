import type { RoundNews } from '../../types/database'

export function NewsArticle({ news }: { news: RoundNews }) {
  const paragraphs = news.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-lg font-bold text-slate-900">{news.title}</h3>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-slate-700">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  )
}
