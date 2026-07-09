import { supabase } from '../lib/supabaseClient'
import type { ScreenshotKind } from '../types/database'

export interface LineupExtraction {
  left: { name: string; position: string; is_legend: boolean }[]
  right: { name: string; position: string; is_legend: boolean }[]
}

export interface GoalsExtraction {
  goals: { minute?: number; scorer_name: string; color: 'black' | 'orange' }[]
}

export function useMatchScreenshotImport() {
  async function uploadAndExtract(input: {
    matchId: string
    kind: ScreenshotKind
    file: File
  }): Promise<{ screenshotId: string; extraction: LineupExtraction | GoalsExtraction }> {
    const extension = input.file.name.split('.').pop() || 'jpg'
    const storagePath = `${input.matchId}/${input.kind}-${crypto.randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('match-screenshots')
      .upload(storagePath, input.file, { contentType: input.file.type })
    if (uploadError) throw uploadError

    const { data: screenshot, error: insertError } = await supabase
      .from('match_screenshots')
      .insert({ match_id: input.matchId, kind: input.kind, storage_path: storagePath })
      .select('*')
      .single()
    if (insertError) throw insertError

    const { data, error: fnError } = await supabase.functions.invoke('extract-match-screenshot', {
      body: { screenshot_id: screenshot.id },
    })
    if (fnError) throw fnError
    if (data?.error) throw new Error(data.error)

    return { screenshotId: screenshot.id, extraction: data.result }
  }

  return { uploadAndExtract }
}
