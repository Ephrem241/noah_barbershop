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
          <div>
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
        </div>

        <nav aria-label="Footer" className={styles.column}>
          <h2 className={`eyebrow ${styles.heading}`}>Explore</h2>
          <ul className={styles.links}>
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
          <h2 className={`eyebrow ${styles.heading}`}>Visit</h2>
          <ul className={styles.facts}>
            <li className={styles.fact}>
              <Icon name="pin" size={16} strokeWidth={1.6} />
              <address>
                {shop.address.line1}
                <br />
                {shop.address.line2}
              </address>
            </li>
            <li className={styles.fact}>
              <Icon name="clock" size={16} strokeWidth={1.6} />
              <p>
                {shop.hours.time}
                <span className={styles.muted}>{shop.hours.days}</span>
              </p>
            </li>
          </ul>
          <a href={shop.directionsUrl} target="_blank" rel="noopener noreferrer" className={styles.action}>
            Get directions
            <Icon name="arrowRight" size={15} strokeWidth={1.8} />
            <span className="visually-hidden"> (opens Google Maps in a new tab)</span>
          </a>
        </div>

        <div className={styles.column}>
          <h2 className={`eyebrow ${styles.heading}`}>Book</h2>
          <a href={shop.phone.href} className={styles.phone}>
            {shop.phone.display}
          </a>
          <p className={styles.note}>Calls only · walk-ins welcome</p>
          <Link to={BARBERS_PATH} className={styles.action}>
            Choose your barber
            <Icon name="arrowRight" size={15} strokeWidth={1.8} />
          </Link>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>
          © {year} {site.name}. All rights reserved.
        </p>
        <div className={styles.bottomLinks}>
          {/* Discreet entry to /admin for the shop's staff */}
          <Link to="/admin" className={styles.subtle}>
            <Icon name="users" size={13} strokeWidth={1.7} />
            Staff sign in
          </Link>
          <SectionLink section="home" className={styles.subtle}>
            Back to top
            <Icon name="arrowUp" size={13} strokeWidth={1.8} />
          </SectionLink>
        </div>
      </div>
    </footer>
  )
}
