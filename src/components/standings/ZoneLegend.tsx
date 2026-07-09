import type { Zone } from '../../types/database'

export function ZoneLegend({ zones }: { zones: Zone[] }) {
  if (zones.length === 0) return null

  return (
    <div className="flex flex-col gap-1 px-1 text-xs text-slate-500">
      {zones.map((zone) => (
        <div key={zone.label} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: zone.color }} />
          <span>
            {zone.label} ({zone.from_position}
            {zone.to_position !== zone.from_position ? `–${zone.to_position}` : ''})
          </span>
        </div>
      ))}
    </div>
  )
}
