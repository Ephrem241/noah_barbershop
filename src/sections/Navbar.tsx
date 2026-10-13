import { useCallback, useEffect, useRef, useState } from 'react'
import { useBookingLink } from '../booking/context'
import { useShop } from '../content/hooks'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { navLinks } from '../data/site'
import { useActiveSection } from '../hooks/useActiveSection'
import { useScrolledPast } from '../hooks/useScrolledPast'
import styles from './Navbar.module.css'

const sectionIds = navLinks.map((link) => link.id)

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useScrolledPast('home', 80)
  const active = useActiveSection(sectionIds, 'home')
  const toggleRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const closeMenu = useCallback((restoreFocus = false) => {
    setMenuOpen(false)
    if (restoreFocus) toggleRef.current?.focus()
  }, [])

  const bookLink = useBookingLink()
  const shop = useShop()
  const drawerBookLink = useBookingLink(undefined, () => closeMenu())

  // Drawer: lock page scroll, focus the first link, close on Escape, keep Tab inside.
  useEffect(() => {
    if (!menuOpen) return
    document.body.classList.add('scroll-locked')
    const drawer = drawerRef.current
    const focusables = () => Array.from(drawer?.querySelectorAll<HTMLElement>('a, button') ?? [])
    focusables()[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeMenu(true)
        return
      }
      if (e.key !== 'Tab') return
      const items = [toggleRef.current, ...focusables()].filter((el): el is HTMLElement => !!el)
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('scroll-locked')
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen, closeMenu])

  // Close the drawer if the viewport grows past the mobile breakpoint.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)')
    const onChange = () => mq.matches && setMenuOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const headerClass = [styles.header, scrolled && styles.solid, menuOpen && styles.menuOpen].filter(Boolean).join(' ')

  return (
    <header className={headerClass}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo onClick={() => closeMenu()} />
        </div>

        <nav aria-label="Primary" className={styles.nav}>
          <ul className={styles.links}>
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className={styles.link}
                  aria-current={active === link.id ? 'location' : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Button {...bookLink} variant="pill" icon="calendar" className={styles.cta}>
            Book Appointment
          </Button>
          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={24} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={drawerRef}
        className={styles.drawer}
        hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <nav aria-label="Mobile" className={styles.drawerNav}>
          <ul>
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className={styles.drawerLink}
                  aria-current={active === link.id ? 'location' : undefined}
                  onClick={() => closeMenu()}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.drawerFooter}>
          <Button {...drawerBookLink} icon="calendar">
            Book Appointment
          </Button>
          <a href={shop.phone.href} className={styles.drawerPhone}>
            <Icon name="phone" size={16} className={styles.gold} />
            {shop.phone.display}
          </a>
        </div>
      </div>
    </header>
  )
}
