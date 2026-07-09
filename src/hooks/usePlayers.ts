import { supabase } from '../lib/supabaseClient'
import type { Player } from '../types/database'

export function usePlayers() {
  async function findOrCreateByName(name: string): Promise<Player> {
    const trimmed = name.trim()
    const { data: existing, error: findError } = await supabase
      .from('players')
      .select('*')
      .ilike('name', trimmed)
      .maybeSingle()
    if (findError) throw findError
    if (existing) return existing as Player

    const { data: created, error: createError } = await supabase
      .from('players')
      .insert({ name: trimmed })
      .select('*')
      .single()
    if (createError) throw createError
    return created as Player
  }

  return { findOrCreateByName }
}
