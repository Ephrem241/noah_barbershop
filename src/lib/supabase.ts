import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/** False when the env vars are missing — the public site then falls back to its built-in content. */
export const isSupabaseConfigured = Boolean(url && key)

export const supabaseUrl = url ?? ''
export const supabaseKey = key ?? ''

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url!, key!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
    })
  : null

export function requireSupabase(): SupabaseClient<Database> {
  if (!supabase) throw new Error('Supabase is not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY).')
  return supabase
}
