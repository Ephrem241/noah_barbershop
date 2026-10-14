import { createContext, useContext } from 'react'
import { slugify } from '../utils/slug'

/**
 * Barber profile dialog, mirrored in the URL hash so a profile can be linked to and Back closes it:
 *   #book/<barberId>   that barber's profile, over whichever page is open (usually /barbers#book/<barberId>)
 */
export type BookingContextValue = {
  /** Id (slug) in the URL of the profile to show, or null */
  barberId: string | null
  openProfile: (barberId: string) => void
  closeProfile: () => void
}

export const BookingContext = createContext<BookingContextValue | null>(null)

export const BARBERS_PATH = '/barbers'

/** The service picked from the menu travels as /barbers?service=<slug of its title> */
export const SERVICE_PARAM = 'service'
export const serviceSlug = (title: string) => slugify(title)
export const barbersPath = (serviceTitle?: string) =>
  serviceTitle ? `${BARBERS_PATH}?${SERVICE_PARAM}=${serviceSlug(serviceTitle)}` : BARBERS_PATH

export const profileHash = (barberId: string) => `#book/${barberId}`

/** "#book/ephrem" → "ephrem"; anything else → null */
export function parseProfileHash(hash: string): string | null {
  const match = /^#book\/([\w-]+)$/.exec(hash)
  return match && match[1] !== 'request' ? match[1] : null
}

/**
 * Links from before the /barbers page (the request form at #booking, the dialog's barber list and request views)
 * → where they lead now; null for any other hash.
 */
export function legacyBookingTarget(hash: string): string | null {
  if (hash === '#booking' || /^#book(?:\/request)?\/?$/.test(hash)) return BARBERS_PATH
  const match = /^#book\/([\w-]+)\/request\/?$/.exec(hash)
  return match ? `${BARBERS_PATH}${profileHash(match[1])}` : null
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used inside <BookingProvider>')
  return ctx
}
