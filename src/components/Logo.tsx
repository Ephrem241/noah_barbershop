import { SectionLink } from './SectionLink'
import styles from './Logo.module.css'

type LogoProps = {
  size?: 'nav' | 'footer'
  onClick?: () => void
}

// The navbar gets the compact lockup (crown, NH monogram, NOAH); the footer has room for the full emblem.
// Source artwork: docs/brand/noah-logo.jpg
const ART = {
  nav: { src: '/images/logo-nav.webp', width: 173, height: 180 },
  footer: { src: '/images/logo.webp', width: 480, height: 517 },
}

export function Logo({ size = 'nav', onClick }: LogoProps) {
  const art = ART[size]
  return (
    <SectionLink section="home" className={`${styles.logo} ${styles[size]}`} onClick={onClick} aria-label="Noah Barbershop — home">
      {/* The footer emblem (91 KB) waits until it's near the screen; the navbar lockup is preloaded */}
      <img
        src={art.src}
        alt=""
        width={art.width}
        height={art.height}
        loading={size === 'footer' ? 'lazy' : undefined}
        decoding="async"
      />
    </SectionLink>
  )
}
