import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const ANTHROPIC_MODEL = 'claude-sonnet-5'

const NEWS_TOOL = {
  name: 'write_news',
  description: 'Publica a materia da rodada com titulo e corpo do texto.',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Titulo chamativo e engracado da materia' },
      body: { type: 'string', description: 'Corpo da materia, com paragrafos separados por linha em branco' },
    },
    required: ['title', 'body'],
  },
}

interface MatchInfo {
  id: string
  home_team_id: string
  away_team_id: string
  home_score: number | null
  away_score: number | null
  penalty_winner_team_id: string | null
  home_team: { id: string; name: string }
  away_team: { id: string; name: string }
}

interface GoalInfo {
  match_id: string
  team_id: string
  minute: number | null
  players: { name: string } | null
}

interface RivalryInfo {
  team_a_id: string
  team_b_id: string | null
}

function isRivalryMatch(homeId: string, awayId: string, rivalries: RivalryInfo[]): boolean {
  return rivalries.some((r) => {
    if (r.team_b_id === null) return r.team_a_id === homeId || r.team_a_id === awayId
    return (r.team_a_id === homeId && r.team_b_id === awayId) || (r.team_a_id === awayId && r.team_b_id === homeId)
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY nao configurada nos secrets do projeto.')
    }

    const { competition_id, round } = await req.json()
    if (!competition_id || round == null) throw new Error('competition_id e round sao obrigatorios.')

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Requisicao sem Authorization header.')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: competition, error: competitionError } = await supabase
      .from('competitions')
      .select('name, season')
      .eq('id', competition_id)
      .single()
    if (competitionError) throw competitionError

    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, home_team_id, away_team_id, home_score, away_score, penalty_winner_team_id, home_team:home_team_id (id, name), away_team:away_team_id (id, name)')
      .eq('competition_id', competition_id)
      .eq('round', round)
      .eq('status', 'played')
    if (matchesError) throw matchesError

    const matchList = (matches ?? []) as unknown as MatchInfo[]
    if (matchList.length === 0) {
      throw new Error('Nenhum jogo com placar encontrado nessa rodada.')
    }

    const matchIds = matchList.map((m) => m.id)

    const { data: goals, error: goalsError } = await supabase
      .from('match_goals')
      .select('match_id, team_id, minute, players:player_id (name)')
      .in('match_id', matchIds)
    if (goalsError) throw goalsError

    const { data: rivalries, error: rivalriesError } = await supabase
      .from('rivalries')
      .select('team_a_id, team_b_id')
    if (rivalriesError) throw rivalriesError

    const goalList = (goals ?? []) as unknown as GoalInfo[]
    const rivalryList = (rivalries ?? []) as RivalryInfo[]

    const matchSummaries = matchList.map((m) => {
      const rivalry = isRivalryMatch(m.home_team_id, m.away_team_id, rivalryList)
      const penaltyNote =
        m.penalty_winner_team_id === m.home_team_id
          ? ` (${m.home_team.name} venceu nos penaltis)`
          : m.penalty_winner_team_id === m.away_team_id
            ? ` (${m.away_team.name} venceu nos penaltis)`
            : ''
      const matchGoals = goalList.filter((g) => g.match_id === m.id)
      const scorers = matchGoals
        .map((g) => `${g.players?.name ?? '?'} (${g.team_id === m.home_team_id ? m.home_team.name : m.away_team.name}${g.minute != null ? ` ${g.minute}'` : ''})`)
        .join(', ')
      return `- ${m.home_team.name} ${m.home_score} x ${m.away_score} ${m.away_team.name}${penaltyNote}${rivalry ? ' [CLASSICO/RIVALIDADE]' : ''}${scorers ? ` | Gols: ${scorers}` : ''}`
    })

    const prompt = `Voce e um redator esportivo de um jornal informal e caricato, no estilo dos comentaristas de TV brasileiros mais exagerados: informal, sarcastico, ironico, cheio de cliche de futebol ("categoria nao se discute", "jogo de resultado", "time entrou concentrado", etc), zoeira pesada mas sempre com humor, nunca ofensa de verdade — e uma brincadeira entre amigos.

Escreva uma materia sobre a rodada ${round} do campeonato "${competition.name}"${competition.season ? ` (temporada ${competition.season})` : ''}, um torneio caseiro entre amigos jogando um jogo de futebol no video game.

Resultados da rodada:
${matchSummaries.join('\n')}

Regras:
- Comente TODOS os jogos da rodada, cada um em pelo menos um paragrafo.
- Jogos marcados como [CLASSICO/RIVALIDADE] merecem ainda mais deboche, provocacao e drama — trate como um classico historico cheio de rivalidade.
- Se houver artilheiros listados, cite pelo nome e faca graca com a atuacao.
- Titulo deve ser chamativo e engracado.
- Nao invente placares ou nomes que nao foram informados.
- Use a tool write_news para responder.`

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 2048,
        tools: [NEWS_TOOL],
        tool_choice: { type: 'tool', name: NEWS_TOOL.name },
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text()
      throw new Error(`Anthropic API error (${anthropicResponse.status}): ${errText}`)
    }

    const anthropicData = await anthropicResponse.json()
    const toolUseBlock = anthropicData.content?.find((block: { type: string }) => block.type === 'tool_use')
    if (!toolUseBlock) throw new Error('A IA nao retornou a materia.')

    return new Response(JSON.stringify({ result: toolUseBlock.input }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido ao gerar a noticia.'
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
      status: 400,
    })
  }
})
