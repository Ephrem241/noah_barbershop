import { Link } from 'react-router-dom'
import { BARBERS_PATH } from '../booking/context'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { SectionLink } from '../components/SectionLink'
import { useShop } from '../content/hooks'
import { navLinks, site } from '../data/site'
import styles from './Footer.module.css'

export function Footer() {
  const shop = useShop()
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo size="footer" />
          <p className={styles.tagline}>Haircuts, fades, beards and grooming near Edna Mall, Bole, Addis Ababa.</p>
          {shop.socials.length ? (
            <ul className={styles.socials}>
              {shop.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    className={styles.social}
                    aria-label={`${site.name} on ${social.label} (opens in a new tab)`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name={social.icon} size={16} strokeWidth={1.7} />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <nav aria-label="Footer" className={styles.column}>
          <h2 className={styles.heading}>Explore</h2>
          <ul className={styles.list}>
            {navLinks.map((link) => (
              <li key={link.id}>
                <SectionLink section={link.id} className={styles.link}>
                  {link.label}
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.column}>
          <h2 className={styles.heading}>Visit</h2>
          <address className={styles.address}>
            {shop.address.line1}
            <br />
            {shop.address.line2}
          </address>
          <p className={styles.detail}>
            {shop.hours.time}
            <br />
            {shop.hours.days}
          </p>
          <a href={shop.directionsUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
            Get directions<span className="visually-hidden"> (opens Google Maps in a new tab)</span>
          </a>
        </div>

        <div className={styles.column}>
          <h2 className={styles.heading}>Book</h2>
          <a href={shop.phone.href} className={styles.phone}>
            {shop.phone.display}
          </a>
          <Link to={BARBERS_PATH} className={styles.link}>
            Choose your barber
          </Link>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>
          © {year} {site.name}. All rights reserved.
        </p>
        {/* Discreet entry to /admin for the shop's staff */}
        <Link to="/admin" className={styles.staff}>
          <Icon name="users" size={13} strokeWidth={1.7} />
          Staff sign in
        </Link>
      </div>
    </footer>
  )
}
