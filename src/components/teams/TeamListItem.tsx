import type { ReactNode } from 'react'
import type { Team } from '../../types/database'
import { TeamCrest } from './TeamCrest'

export function TeamListItem({
  team,
  onEdit,
  onRemove,
  trailing,
}: {
  team: Team
  onEdit?: () => void
  onRemove?: () => void
  trailing?: ReactNode
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <TeamCrest team={team} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{team.name}</p>
        {team.coach_name && <p className="truncate text-xs text-slate-500">Téc. {team.coach_name}</p>}
      </div>
      {trailing}
      {onEdit && (
        <button onClick={onEdit} className="text-xs font-medium text-emerald-700 hover:underline">
          Editar
        </button>
      )}
      {onRemove && (
        <button onClick={onRemove} className="text-xs font-medium text-red-600 hover:underline">
          Remover
        </button>
      )}
    </li>
  )
}
