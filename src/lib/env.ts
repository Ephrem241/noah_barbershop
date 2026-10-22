// Supabase project settings, without the Supabase client: the public site reads its content with plain requests
// (src/content/rest.ts), so the client library only loads with the admin panel (src/lib/supabase.ts).

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/** False when the env vars are missing — the public site then falls back to its built-in content. */
export const isSupabaseConfigured = Boolean(url && key)

export const supabaseUrl = url ?? ''
export const supabaseKey = key ?? ''
