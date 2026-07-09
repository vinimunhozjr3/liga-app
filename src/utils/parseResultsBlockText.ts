export interface ParsedResult {
  round: number
  homeTeamName: string
  awayTeamName: string
  homeScore: number
  awayScore: number
  penaltyWinnerName: string | null
}

const ROUND_RE = /rodada\s+(\d+)/i
const RESTS_RE = /^descansa(?:ram|do|ndo|u)?\b/i
const PENALTY_RE = /^(.+?)\s+venceu\s+nos\s+p[êe]naltis/i
const SCORE_RE = /^(.+?)\s+(\d+)\s*x\s*(\d+)\s+(.+)$/i

export function parseResultsBlockText(text: string): ParsedResult[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const results: ParsedResult[] = []
  let currentRound: number | null = null

  for (const line of lines) {
    const roundMatch = line.match(ROUND_RE)
    if (roundMatch) {
      currentRound = Number(roundMatch[1])
      continue
    }
    if (RESTS_RE.test(line)) continue

    const penaltyMatch = line.match(PENALTY_RE)
    if (penaltyMatch && results.length > 0) {
      results[results.length - 1].penaltyWinnerName = penaltyMatch[1].trim()
      continue
    }

    const scoreMatch = line.match(SCORE_RE)
    if (scoreMatch && currentRound != null) {
      results.push({
        round: currentRound,
        homeTeamName: scoreMatch[1].trim(),
        homeScore: Number(scoreMatch[2]),
        awayScore: Number(scoreMatch[3]),
        awayTeamName: scoreMatch[4].trim(),
        penaltyWinnerName: null,
      })
    }
  }

  return results
}
