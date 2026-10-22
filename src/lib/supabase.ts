import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from './env'

// The Supabase client, for the admin panel (sign-in, writes, uploads). The public site doesn't import this file.
export { isSupabaseConfigured, supabaseKey, supabaseUrl }

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
    })
  : null

export function requireSupabase(): SupabaseClient<Database> {
  if (!supabase) throw new Error('Supabase is not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY).')
  return supabase
}
