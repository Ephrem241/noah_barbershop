import { useState, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { isSupabaseConfigured } from '../lib/supabase'
import { readAuthError, signInWithGoogle, signOut, useIsAdmin, useSession } from './auth'
import { SessionContext } from './session'
import { errorMessage } from './ui/feedback'
import styles from './admin.module.css'

function Screen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className={styles.screen}>
      <div className={styles.screenCard}>
        <Icon name="crown" className={styles.screenCrown} />
        <p className="eyebrow">Noah Barbershop</p>
        <h1 className={styles.screenTitle}>{title}</h1>
        {children}
        <a href="/" className={styles.screenBack}>
          ← Back to the website
        </a>
      </div>
    </main>
  )
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

function LoginScreen() {
  const [error, setError] = useState<string | null>(readAuthError)
  const [busy, setBusy] = useState(false)

  const login = async () => {
    setBusy(true)
    setError(null)
    try {
      await signInWithGoogle() // redirects to Google
    } catch (e) {
      setError(errorMessage(e))
      setBusy(false)
    }
  }

  return (
    <Screen title="Admin sign in">
      <p className={styles.screenText}>Manage barbers, services, prices, photos and booking requests.</p>
      <button type="button" className={styles.googleButton} onClick={login} disabled={busy}>
        <GoogleMark />
        {busy ? 'Opening Google…' : 'Sign in with Google'}
      </button>
      {error ? (
        <p className={styles.screenError} role="alert">
          {error}
          <br />
          <span className={styles.screenHint}>
            If this keeps happening, Google sign-in may not be enabled yet — see docs/ADMIN_SETUP.md.
          </span>
        </p>
      ) : null}
    </Screen>
  )
}

/** Signed out → Google sign-in. Signed in but not on the admin list → "not authorized". Admin → the panel. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useSession()
  const admin = useIsAdmin(session)

  if (!isSupabaseConfigured) {
    return (
      <Screen title="Backend not configured">
        <p className={styles.screenText}>Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then reload.</p>
      </Screen>
    )
  }
  if (loading || (session && admin.isPending)) {
    return <div className="admin-boot" role="status" aria-label="Checking your account" />
  }
  if (!session) return <LoginScreen />
  if (admin.isError || !admin.data) {
    return (
      <Screen title="Not authorized">
        <p className={styles.screenText}>
          {session.user.email} isn’t on the admin list. Ask an existing admin to add this Google account under
          Admins.
        </p>
        <Button variant="secondary" icon="logout" onClick={() => void signOut()}>
          Sign out
        </Button>
      </Screen>
    )
  }
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}
