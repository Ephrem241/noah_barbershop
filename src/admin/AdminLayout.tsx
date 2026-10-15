import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { requireSupabase } from '../lib/supabase'
import { signOut } from './auth'
import { useInvalidate, useRows } from './data'
import { useAdminSession } from './session'
import { useFeedback } from './ui/feedback'
import styles from './admin.module.css'

const NAV: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/admin', label: 'Dashboard', icon: 'grid', end: true },
  { to: '/admin/requests', label: 'Booking requests', icon: 'calendar' },
  { to: '/admin/barbers', label: 'Barbers', icon: 'scissors' },
  { to: '/admin/services', label: 'Services & prices', icon: 'bottle' },
  { to: '/admin/gallery', label: 'Gallery', icon: 'image' },
  { to: '/admin/testimonials', label: 'Testimonials', icon: 'star' },
  { to: '/admin/settings', label: 'Shop info', icon: 'pin' },
  { to: '/admin/admins', label: 'Admins', icon: 'users' },
]

/** Live inbox: new or changed booking requests refresh the admin instantly (realtime respects RLS). */
function useRequestsRealtime() {
  const invalidate = useInvalidate()
  const { toast } = useFeedback()
  useEffect(() => {
    const supabase = requireSupabase()
    const channel = supabase
      .channel('admin-booking-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_requests' }, (payload) => {
        invalidate('booking_requests')
        if (payload.eventType === 'INSERT') {
          const name = (payload.new as { name?: string }).name
          toast(`New booking request${name ? ` from ${name}` : ''}`)
        }
      })
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- subscribe once per admin session
  }, [])
}

export function AdminLayout() {
  const session = useAdminSession()
  const requests = useRows('booking_requests', 'created_at', false)
  const newCount = requests.data?.filter((r) => r.status === 'new').length ?? 0
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()
  useRequestsRealtime()

  // Close the mobile drawer after navigating
  const [lastPath, setLastPath] = useState(location.pathname)
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setNavOpen(false)
  }

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={navOpen}
          aria-controls="admin-nav"
          aria-label={navOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setNavOpen((o) => !o)}
        >
          <Icon name={navOpen ? 'close' : 'menu'} size={22} />
        </button>
        <span className={styles.brand}>
          <img src="/images/logo-mark.webp" alt="" width={104} height={96} className={styles.brandMark} />
          NOAH <span>Admin</span>
        </span>
      </header>

      <aside id="admin-nav" className={styles.sidebar} data-open={navOpen}>
        <span className={`${styles.brand} ${styles.sidebarBrand}`}>
          <img src="/images/logo-mark.webp" alt="" width={104} height={96} className={styles.brandMark} />
          NOAH <span>Admin</span>
        </span>
        <nav aria-label="Admin">
          <ul className={styles.nav}>
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={({ isActive }) => (isActive ? styles.navActive : undefined)}>
                  <Icon name={item.icon} size={18} strokeWidth={1.6} />
                  {item.label}
                  {item.to === '/admin/requests' && newCount > 0 ? (
                    <span className={styles.badge} aria-label={`${newCount} new`}>
                      {newCount}
                    </span>
                  ) : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.account}>
          <a href="/" target="_blank" rel="noopener noreferrer" className={styles.viewSite}>
            <Icon name="external" size={15} strokeWidth={1.7} />
            View website
          </a>
          <p className={styles.email} title={session.user.email}>
            {session.user.email}
          </p>
          <button type="button" className={styles.signOut} onClick={() => void signOut()}>
            <Icon name="logout" size={15} strokeWidth={1.7} />
            Sign out
          </button>
        </div>
      </aside>

      <main className={styles.main} id="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
