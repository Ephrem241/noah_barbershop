import type { Session } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

export const SessionContext = createContext<Session | null>(null)

/** The signed-in admin's session (only available inside the auth gate). */
export function useAdminSession() {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useAdminSession must be used inside <AuthGate>')
  return session
}
