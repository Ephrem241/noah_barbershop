import type { Session } from '@supabase/supabase-js'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { isSupabaseConfigured, requireSupabase, supabase } from '../lib/supabase'

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
