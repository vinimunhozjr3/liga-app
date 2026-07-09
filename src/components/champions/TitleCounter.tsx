import { useState } from 'react'

export function TitleCounter({
  count,
  onChange,
}: {
  count: number
  onChange: (newCount: number) => Promise<void>
}) {
  const [busy, setBusy] = useState(false)

  async function step(delta: number) {
    if (busy) return
    setBusy(true)
    try {
      await onChange(count + delta)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => step(-1)}
        disabled={busy || count === 0}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
        aria-label="Diminuir"
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-semibold text-slate-900">{count}</span>
      <button
        onClick={() => step(1)}
        disabled={busy}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
        aria-label="Aumentar"
      >
        +
      </button>
    </div>
  )
}
