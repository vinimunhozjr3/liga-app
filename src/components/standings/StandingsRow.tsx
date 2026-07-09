import type { StandingsRow as StandingsRowType, Zone } from '../../types/database'
import { TeamCrest } from '../teams/TeamCrest'
import { ZoneStripe } from './ZoneStripe'
import { FormBadges } from './FormBadges'
import { zoneForPosition } from '../../utils/zoneConfig'

export function StandingsRow({ row, zones }: { row: StandingsRowType; zones: Zone[] }) {
  const zone = zoneForPosition(zones, row.position)

  return (
    <tr className="relative border-b border-slate-100 last:border-0">
      <td className="relative py-2 pl-3 pr-1 text-sm font-medium text-slate-500">
        <ZoneStripe color={zone?.color ?? null} />
        {row.position}
      </td>
      <td className="py-2 pr-2">
        <TeamCrest team={{ name: row.team_name, crest_url: row.crest_url }} size={24} />
      </td>
      <td className="py-2 pr-3 text-left text-sm font-medium text-slate-900">{row.team_name}</td>
      <td className="px-2 py-2 text-center text-sm font-bold text-slate-900">{row.points}</td>
      <td className="px-2 py-2 text-center text-sm text-slate-600">{row.played}</td>
      <td className="px-2 py-2 text-center text-sm text-slate-600">{row.wins}</td>
      <td className="px-2 py-2 text-center text-sm text-slate-600">{row.draws}</td>
      <td className="px-2 py-2 text-center text-sm text-slate-600">{row.losses}</td>
      <td className="hidden px-2 py-2 text-center text-sm text-slate-600 sm:table-cell">{row.goals_for}</td>
      <td className="hidden px-2 py-2 text-center text-sm text-slate-600 sm:table-cell">{row.goals_against}</td>
      <td className="px-2 py-2 text-center text-sm text-slate-600">{row.goal_diff}</td>
      <td className="px-3 py-2">
        <FormBadges results={row.last_five} />
      </td>
    </tr>
  )
}
