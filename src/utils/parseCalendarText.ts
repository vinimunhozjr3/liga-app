export interface ParsedCalendarMatch {
  round: number
  homeTeamName: string
  awayTeamName: string
}

export interface ParsedCalendar {
  teamNames: string[]
  matches: ParsedCalendarMatch[]
}

const ROUND_RE = /^rodada\s+(\d+)/i
const TURNO_RE = /^turno\b/i
const RESTS_RE = /^descansa(?:ram|do|ndo|u)?\b/i
const MATCHUP_RE = /^(.+?)\s+x\s+(.+)$/i

export function parseCalendarText(text: string): ParsedCalendar {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const teamNames: string[] = []
  const matches: ParsedCalendarMatch[] = []
  let currentRound: number | null = null

  for (const line of lines) {
    const roundMatch = line.match(ROUND_RE)
    if (roundMatch) {
      currentRound = Number(roundMatch[1])
      continue
    }
    if (TURNO_RE.test(line)) continue
    if (RESTS_RE.test(line)) continue

    const matchup = line.match(MATCHUP_RE)
    if (matchup && currentRound != null) {
      matches.push({ round: currentRound, homeTeamName: matchup[1].trim(), awayTeamName: matchup[2].trim() })
      continue
    }

    if (currentRound == null) {
      teamNames.push(line)
    }
  }

  return { teamNames, matches }
}
