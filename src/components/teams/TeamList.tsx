import type { Team } from '../../types/database'
import { TeamListItem } from './TeamListItem'
import { EmptyState } from '../ui/EmptyState'

export function TeamList({
  teams,
  onEdit,
  onRemove,
  isAdmin = true,
}: {
  teams: Team[]
  onEdit: (team: Team) => void
  onRemove: (team: Team) => void
  isAdmin?: boolean
}) {
  if (teams.length === 0) {
    return <EmptyState title="Nenhum time nessa competição" description="Adicione os times participantes." />
  }

  return (
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      {teams.map((team) => (
        <TeamListItem
          key={team.id}
          team={team}
          onEdit={isAdmin ? () => onEdit(team) : undefined}
          onRemove={isAdmin ? () => onRemove(team) : undefined}
        />
      ))}
    </ul>
  )
}
