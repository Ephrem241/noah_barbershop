import { createContext, useContext } from 'react'

/**
 * Booking dialog state, mirrored in the URL:
 *   #book                    barber list
 *   #book/<barberId>         barber profile
 *   #book/request            appointment request form (any barber)
 *   #book/<barberId>/request appointment request form for that barber
 */
export type BookingRoute = { open: false } | { open: true; barberId: string | null; request: boolean }

/** Choices handed to the on-page request form (#booking); `version` changes on every hand-off. */
export type RequestPrefill = { serviceId?: string; barberId?: string; version: number }

export type BookingContextValue = {
  route: BookingRoute
  openBooking: (barberId?: string) => void
  showBarber: (barberId: string) => void
  showRequest: (barberId: string | null) => void
  /** Back to the previous dialog view (profile → list, request → profile or list) */
  goBack: () => void
  closeBooking: () => void
  prefill: RequestPrefill | null
  /** Pre-select a service or barber in the on-page request form (the caller's #booking link does the scrolling) */
  prefillRequest: (values: Omit<RequestPrefill, 'version'>) => void
}

export const BookingContext = createContext<BookingContextValue | null>(null)

/** Id of the on-page booking section. Not "#book…": that prefix belongs to the dialog routes above. */
export const BOOKING_SECTION_ID = 'booking'

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
