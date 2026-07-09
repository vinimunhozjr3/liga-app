export function TeamRecordSummary({
  teamName,
  wins,
  draws,
  losses,
}: {
  teamName: string
  wins: number
  draws: number
  losses: number
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
      <span className="font-medium text-slate-700">{teamName}</span>
      <span className="flex gap-3 text-xs text-slate-600">
        <span className="text-emerald-600">{wins}V</span>
        <span className="text-slate-400">{draws}E</span>
        <span className="text-red-500">{losses}D</span>
      </span>
    </div>
  )
}
