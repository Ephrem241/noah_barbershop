import type { Session } from '@supabase/supabase-js'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { isSupabaseConfigured, requireSupabase, supabase, supabaseKey, supabaseUrl } from '../lib/supabase'

/**
 * Is Google sign-in switched on in the Supabase dashboard? Reads the public auth settings, so the login
 * screen can explain instead of sending the user to a raw "provider is not enabled" error page.
 * Resolves to null when it can't tell — the button then simply tries.
 */
export function useGoogleEnabled() {
  return useQuery({
    queryKey: ['auth', 'google-enabled'],
    enabled: isSupabaseConfigured,
    staleTime: 5 * 60_000,
    retry: false,
    queryFn: async () => {
      try {
        const res = await fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: supabaseKey } })
        if (!res.ok) return null
        const json = (await res.json()) as { external?: Record<string, boolean> }
        return json.external?.google ?? null
      } catch {
        return null
      }
    },
  })
}

export function useSession() {
  const [state, setState] = useState<{ session: Session | null; loading: boolean }>({
    session: null,
    loading: isSupabaseConfigured,
  })

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setState({ session: data.session, loading: false }))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setState({ session, loading: false }))
    return () => data.subscription.unsubscribe()
  }, [])

  return state
}

/** Asks the database (the same check every security policy uses) whether this account is an admin. */
export function useIsAdmin(session: Session | null) {
  return useQuery({
    queryKey: ['admin', 'is_admin', session?.user.id],
    enabled: !!session,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await requireSupabase().rpc('is_admin')
      if (error) throw new Error(error.message)
      return data === true
    },
  })
}

export async function signInWithGoogle() {
  const { error } = await requireSupabase().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/admin`,
      queryParams: { prompt: 'select_account' },
    },
  })
  if (error) throw new Error(error.message)
}

export async function signOut() {
  await requireSupabase().auth.signOut()
}

/** Errors Supabase appends to the redirect URL after a failed Google sign-in. */
export function readAuthError(): string | null {
  const params = new URLSearchParams(window.location.search || window.location.hash.replace(/^#/, '?'))
  return params.get('error_description') ?? params.get('error')
}
