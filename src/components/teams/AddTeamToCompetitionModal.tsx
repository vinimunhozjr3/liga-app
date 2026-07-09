import { useState } from 'react'
import type { Team } from '../../types/database'
import type { TeamInput } from '../../hooks/useTeams'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { TeamCrest } from './TeamCrest'
import { TeamFormModal } from './TeamFormModal'

export function AddTeamToCompetitionModal({
  open,
  onClose,
  allTeams,
  existingTeamIds,
  onAddExisting,
  onCreateAndAdd,
}: {
  open: boolean
  onClose: () => void
  allTeams: Team[]
  existingTeamIds: Set<string>
  onAddExisting: (teamId: string) => Promise<void>
  onCreateAndAdd: (input: TeamInput) => Promise<void>
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)

  const availableTeams = allTeams.filter((t) => !existingTeamIds.has(t.id))

  async function handleAdd(teamId: string) {
    setAddingId(teamId)
    try {
      await onAddExisting(teamId)
    } finally {
      setAddingId(null)
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title="Adicionar time">
        <div className="flex flex-col gap-3">
          <Button variant="secondary" onClick={() => setCreateOpen(true)}>
            + Criar novo time
          </Button>

          {availableTeams.length > 0 ? (
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {availableTeams.map((team) => (
                <li key={team.id} className="flex items-center gap-3 px-3 py-2">
                  <TeamCrest team={team} size={28} />
                  <span className="flex-1 truncate text-sm text-slate-900">{team.name}</span>
                  <button
                    onClick={() => handleAdd(team.id)}
                    disabled={addingId === team.id}
                    className="text-xs font-medium text-emerald-700 hover:underline disabled:text-slate-400"
                  >
                    {addingId === team.id ? 'Adicionando...' : 'Adicionar'}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-sm text-slate-500">
              Todos os times já cadastrados estão nessa competição.
            </p>
          )}
        </div>
      </Modal>

      <TeamFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (input) => {
          await onCreateAndAdd(input)
        }}
      />
    </>
  )
}
