const styles: Record<string, string> = {
  V: 'bg-emerald-500',
  E: 'bg-slate-400',
  D: 'bg-red-500',
}

export function FormBadges({ results }: { results: string[] }) {
  if (results.length === 0) {
    return <span className="text-xs text-slate-300">—</span>
  }

  return (
    <div className="flex items-center gap-1">
      {results.map((r, i) => (
        <span
          key={i}
          className={`h-3.5 w-3.5 rounded-full ${styles[r] ?? 'bg-slate-200'}`}
          title={r === 'V' ? 'Vitória' : r === 'E' ? 'Empate' : 'Derrota'}
        />
      ))}
    </div>
  )
}
