import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useBarbers } from '../content/hooks'
import { BookingDialog } from './BookingDialog'
import { BookingContext, parseProfileHash, profileHash } from './context'

/*
 * Opening a profile pushes a history entry carrying { bookingDepth }, so the browser Back button closes it, and
 * closing jumps straight back to the page entry with history.go(-depth).
 */
type HistoryState = { bookingDepth?: number } | null

const historyState = () => (window.history.state as HistoryState) ?? null
const depth = () => historyState()?.bookingDepth ?? 0
const pageUrl = () => window.location.pathname + window.location.search
const barberFromLocation = () => parseProfileHash(window.location.hash)

/** Deep link (/barbers#book/ephrem): slide a plain page entry underneath, so closing lands on the page. */
function slidePageUnderneath() {
  if (barberFromLocation() && historyState()?.bookingDepth == null) {
    const hash = window.location.hash
    window.history.replaceState(null, '', pageUrl())
    window.history.pushState({ bookingDepth: 1 }, '', hash)
  }
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [barberId, setBarberId] = useState(barberFromLocation)
  const { data: barbers, isLoading: barbersLoading } = useBarbers()

  // Router navigations (e.g. an old link redirected to /barbers#book/<id>) don't fire popstate: follow them here
  const [seenKey, setSeenKey] = useState(location.key)
  if (location.key !== seenKey) {
    setSeenKey(location.key)
    setBarberId(parseProfileHash(location.hash))
  }

  useEffect(slidePageUnderneath, [location.key])

  // Back/forward buttons and hand-edited hashes
  useEffect(() => {
    const sync = () => setBarberId(barberFromLocation())
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  // A link to a profile that isn't published: drop the hash so the address matches the page shown
  useEffect(() => {
    if (!barberId || barbersLoading || barbers.some((b) => b.id === barberId)) return
    if (barberFromLocation() === barberId) window.history.replaceState(window.history.state, '', pageUrl())
  }, [barberId, barbers, barbersLoading])

  const openProfile = useCallback((id: string) => {
    window.history.pushState({ bookingDepth: depth() + 1 }, '', profileHash(id))
    setBarberId(id)
  }, [])

  const closeProfile = useCallback(() => {
    const steps = depth()
    setBarberId(null)
    if (steps > 0) window.history.go(-steps)
    else window.history.replaceState(null, '', pageUrl())
  }, [])

  const value = useMemo(() => ({ barberId, openProfile, closeProfile }), [barberId, openProfile, closeProfile])

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingDialog />
    </BookingContext.Provider>
  )
}
