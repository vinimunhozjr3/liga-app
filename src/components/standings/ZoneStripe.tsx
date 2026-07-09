export function ZoneStripe({ color }: { color: string | null }) {
  return (
    <div
      className="absolute inset-y-0 left-0 w-1"
      style={{ backgroundColor: color ?? 'transparent' }}
      aria-hidden="true"
    />
  )
}
