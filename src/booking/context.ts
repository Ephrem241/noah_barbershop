import { createContext, useContext, type MouseEvent } from 'react'

/**
 * Booking dialog state, mirrored in the URL:
 *   #book                    barber list
 *   #book/<barberId>         barber profile
 *   #book/request            appointment request form (any barber)
 *   #book/<barberId>/request appointment request form for that barber
 */
export type BookingRoute = { open: false } | { open: true; barberId: string | null; request: boolean }

export type BookingContextValue = {
  route: BookingRoute
  openBooking: (barberId?: string) => void
  showBarber: (barberId: string) => void
  showRequest: (barberId: string | null) => void
  /** Back to the previous dialog view (profile → list, request → profile or list) */
  goBack: () => void
  closeBooking: () => void
}

export const BookingContext = createContext<BookingContextValue | null>(null)

export const bookingHash = (barberId?: string | null, request = false) =>
  `#book${barberId ? `/${barberId}` : ''}${request ? '/request' : ''}`

export function parseBookingHash(hash: string): BookingRoute {
  const match = /^#book(?:\/([\w-]+))?(?:\/(request))?$/.exec(hash)
  if (!match) return { open: false }
  if (match[1] === 'request' && !match[2]) return { open: true, barberId: null, request: true }
  return { open: true, barberId: match[1] ?? null, request: Boolean(match[2]) }
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used inside <BookingProvider>')
  return ctx
}

/**
 * Props for a link that opens the booking dialog. Plain clicks open it in place; ctrl/⌘/middle-clicks are
 * left to the browser, which opens the shareable #book link in a new tab.
 */
export function useBookingLink(barberId?: string, onOpen?: () => void) {
  const { openBooking } = useBooking()
  return {
    href: bookingHash(barberId),
    onClick: (e: MouseEvent<HTMLAnchorElement>) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      onOpen?.()
      openBooking(barberId)
    },
  }
}
