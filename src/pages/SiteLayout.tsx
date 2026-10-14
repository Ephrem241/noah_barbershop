import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { BookingProvider } from '../booking/BookingProvider'
import { legacyBookingTarget, parseProfileHash } from '../booking/context'
import { StickyBookingBar } from '../components/StickyBookingBar'
import { useIsHomePage } from '../hooks/useIsHomePage'
import { Footer } from '../sections/Footer'
import { Navbar } from '../sections/Navbar'

/**
 * Page changes inside the site: a new page starts at the top, or at the section its link names (/#services).
 * Back and forward are left to the browser, which restores the earlier scroll position.
 */
function useScrollOnPageChange() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()
  const lastPath = useRef(pathname)

  useEffect(() => {
    if (lastPath.current === pathname) return
    lastPath.current = pathname
    if (navigationType === 'POP') return
    const target = hash && !parseProfileHash(hash) ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
    if (target) target.scrollIntoView({ behavior: 'instant' })
    else window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash, navigationType])
}

/** Navbar, footer and the barber profile dialog, around the homepage and /barbers. */
export function SiteLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = useIsHomePage()

  // Links from before /barbers existed (/#booking, /#book, /#book/<id>/request) lead to the barbers page now
  useEffect(() => {
    const target = legacyBookingTarget(location.hash)
    if (target) navigate(target, { replace: true })
  }, [location.hash, navigate])

  useScrollOnPageChange()

  return (
    <BookingProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      {isHome ? <StickyBookingBar /> : null}
    </BookingProvider>
  )
}
