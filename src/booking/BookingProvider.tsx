import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useBarbers } from '../content/hooks'
import { BookingDialog } from './BookingDialog'
import { BookingContext, bookingHash, parseBookingHash, type BookingRoute } from './context'

/*
 * Every dialog step we push carries { bookingDepth } in history.state, so the browser Back button walks
 * back through the views, and closing jumps straight to the page entry with history.go(-depth).
 * Steps pushed from inside the dialog are flagged `inDialog`, so in-dialog "Back" can use history.back().
 */
type HistoryState = { bookingDepth?: number; inDialog?: boolean } | null

const historyState = () => (window.history.state as HistoryState) ?? null
const depth = () => historyState()?.bookingDepth ?? 0
const pageUrl = () => window.location.pathname + window.location.search
const routeFromLocation = (): BookingRoute => parseBookingHash(window.location.hash)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<BookingRoute>(routeFromLocation)
  const { data: barbers, isLoading: barbersLoading } = useBarbers()

  // Deep link (/#book/ephrem): slide a plain page entry underneath, so closing lands on the page.
  useEffect(() => {
    if (parseBookingHash(window.location.hash).open && historyState()?.bookingDepth == null) {
      const hash = window.location.hash
      window.history.replaceState(null, '', pageUrl())
      window.history.pushState({ bookingDepth: 1 }, '', hash)
    }
  }, [])

  // Back/forward buttons and hand-edited hashes
  useEffect(() => {
    const sync = () => setRoute(routeFromLocation())
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  // Unknown barber links fall back to the list (the dialog renders it); tidy the URL to match.
  useEffect(() => {
    if (!route.open || !route.barberId || barbersLoading) return
    if (!barbers.some((b) => b.id === route.barberId)) {
      window.history.replaceState(window.history.state, '', bookingHash(null, route.request))
    }
  }, [route, barbers, barbersLoading])

  const push = useCallback((next: Extract<BookingRoute, { open: true }>, inDialog: boolean) => {
    window.history.pushState({ bookingDepth: depth() + 1, inDialog }, '', bookingHash(next.barberId, next.request))
    setRoute(next)
  }, [])

  const openBooking = useCallback(
    (barberId?: string) => push({ open: true, barberId: barberId ?? null, request: false }, false),
    [push],
  )
  const showBarber = useCallback(
    (barberId: string) => push({ open: true, barberId, request: false }, true),
    [push],
  )
  const showRequest = useCallback(
    (barberId: string | null) => push({ open: true, barberId, request: true }, true),
    [push],
  )

  const goBack = useCallback(() => {
    if (historyState()?.inDialog) {
      window.history.back() // popstate restores the previous view
      return
    }
    // Arrived by deep link: step to the parent view in place
    const current = routeFromLocation()
    const parent: BookingRoute =
      current.open && current.request && current.barberId
        ? { open: true, barberId: current.barberId, request: false }
        : { open: true, barberId: null, request: false }
    window.history.replaceState({ bookingDepth: depth() }, '', bookingHash(parent.barberId, false))
    setRoute(parent)
  }, [])

  const closeBooking = useCallback(() => {
    const steps = depth()
    setRoute({ open: false })
    if (steps > 0) window.history.go(-steps)
    else window.history.replaceState(null, '', pageUrl())
  }, [])

  const value = useMemo(
    () => ({ route, openBooking, showBarber, showRequest, goBack, closeBooking }),
    [route, openBooking, showBarber, showRequest, goBack, closeBooking],
  )

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingDialog />
    </BookingContext.Provider>
  )
}
