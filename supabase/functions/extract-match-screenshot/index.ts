import { createClient } from 'jsr:@supabase/supabase-js@2'
import { encodeBase64 } from 'jsr:@std/encoding/base64'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const ANTHROPIC_MODEL = 'claude-sonnet-5'

const LINEUP_TOOL = {
  name: 'extract_lineup',
  description:
    'Extrai as duas escalacoes visiveis no print (coluna da esquerda e coluna da direita), com nome do jogador, sigla da posicao e se esta em destaque dourado (Legend).',
  input_schema: {
    type: 'object',
    properties: {
      left: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Nome do jogador como aparece no print' },
            position: { type: 'string', description: 'Sigla da posicao, ex: GOL, LD, ZAG, VOL, MC, CA' },
            is_legend: { type: 'boolean', description: 'true se a linha tem destaque/fundo dourado' },
          },
          required: ['name', 'position', 'is_legend'],
        },
      },
      right: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            position: { type: 'string' },
            is_legend: { type: 'boolean' },
          },
          required: ['name', 'position', 'is_legend'],
        },
      },
    },
    required: ['left', 'right'],
  },
}

const GOALS_TOOL = {
  name: 'extract_goals',
  description:
    'Extrai a lista cronologica de gols do print, com minuto, nome do artilheiro e a cor do indicador do time (preto ou laranja).',
  input_schema: {
    type: 'object',
    properties: {
      goals: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            minute: { type: 'integer', description: 'Minuto do gol, omitir se ilegivel' },
            scorer_name: { type: 'string' },
            color: { type: 'string', enum: ['black', 'orange'] },
          },
          required: ['scorer_name', 'color'],
        },
      },
    },
    required: ['goals'],
  },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY nao configurada nos secrets do projeto.')
    }

    const { screenshot_id } = await req.json()
    if (!screenshot_id) throw new Error('screenshot_id obrigatorio.')

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Requisicao sem Authorization header.')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: screenshot, error: screenshotError } = await supabase
      .from('match_screenshots')
      .select('*')
      .eq('id', screenshot_id)
      .single()
    if (screenshotError) throw screenshotError

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('match-screenshots')
      .download(screenshot.storage_path)
    if (downloadError) throw downloadError

    const mediaType = fileBlob.type || 'image/jpeg'
    const bytes = new Uint8Array(await fileBlob.arrayBuffer())
    const base64Image = encodeBase64(bytes)

    const isLineup = screenshot.kind === 'lineup'
    const tool = isLineup ? LINEUP_TOOL : GOALS_TOOL
    const instructions = isLineup
      ? 'Este print mostra duas escalacoes lado a lado, uma coluna a esquerda e outra a direita. Para cada jogador leia tres coisas: (1) o NOME do jogador, que aparece como o texto principal da linha (geralmente a fonte maior/mais destacada); (2) a sigla da posicao, que fica numa caixinha pequena ao lado do nome (ex: GOL, LD, ZAG, LE, VOL, MC, CA, PD, PE); (3) se a linha tem destaque/fundo dourado (jogador "Legend") — se nao tiver destaque dourado, is_legend deve ser false. IMPORTANTE: nunca retorne "name" como string vazia. Mesmo que o nome esteja com fonte pequena, estilizada ou parcialmente dificil de ler, faca sua melhor tentativa de leitura e retorne o texto mais proximo possivel do que consegue ver — nunca omita ou deixe em branco. Ignore elementos de interface que nao sejam jogadores (titulos, placar, publicidade, nomes de time, retrospecto). Use a tool extract_lineup para responder.'
      : 'Este print mostra uma lista cronologica de gols de uma partida. Cada linha tem um minuto, um icone/bolinha colorida (preta ou laranja) indicando o time, e o nome do jogador que fez o gol. IMPORTANTE: nunca retorne "scorer_name" como string vazia — se a leitura for dificil, faca sua melhor tentativa. Ignore qualquer secao de disputa de penaltis (penalty shootout) se houver — extraia apenas os gols do tempo normal/prorrogacao. Use a tool extract_goals para responder.'

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 4096,
        tools: [tool],
        tool_choice: { type: 'tool', name: tool.name },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Image } },
              { type: 'text', text: instructions },
            ],
          },
        ],
      }),
    })

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text()
      throw new Error(`Anthropic API error (${anthropicResponse.status}): ${errText}`)
    }

    const anthropicData = await anthropicResponse.json()
    const toolUseBlock = anthropicData.content?.find((block: { type: string }) => block.type === 'tool_use')
    if (!toolUseBlock) throw new Error('A IA nao retornou dados estruturados.')

    return new Response(JSON.stringify({ kind: screenshot.kind, result: toolUseBlock.input }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido na extracao.'
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
      status: 400,
    })
  }
})
