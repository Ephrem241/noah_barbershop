import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { useShop } from '../content/hooks'
import { navLinks, site } from '../data/site'
import styles from './Footer.module.css'

export function Footer() {
  const { socials } = useShop()

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo size="footer" />
        </div>

        <nav aria-label="Footer" className={styles.nav}>
          <ul className={styles.links}>
            {navLinks.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} className={styles.link}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.meta}>
          {socials.length ? (
            <ul className={styles.socials}>
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    className={styles.social}
                    aria-label={`${site.name} on ${social.label}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name={social.icon} size={14} strokeWidth={1.8} />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          <p className={styles.copyright}>
            © {site.copyrightYear} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
