import type { Team } from '../../types/database'

export function TeamCrest({ team, size = 32 }: { team: Pick<Team, 'name' | 'crest_url'>; size?: number }) {
  const style = { width: size, height: size }

  if (team.crest_url) {
    return (
      <img
        src={team.crest_url}
        alt={team.name}
        style={style}
        className="rounded-full object-cover"
      />
    )
  }

  const initials = team.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

  return (
    <div
      style={style}
      className="flex flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600"
    >
      {initials || '?'}
    </div>
  )
}
