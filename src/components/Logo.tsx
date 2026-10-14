import { Icon } from './Icon'
import { SectionLink } from './SectionLink'
import styles from './Logo.module.css'

type LogoProps = {
  size?: 'nav' | 'footer'
  onClick?: () => void
}

export function Logo({ size = 'nav', onClick }: LogoProps) {
  return (
    <SectionLink section="home" className={`${styles.logo} ${styles[size]}`} onClick={onClick} aria-label="Noah Barbershop — home">
      <Icon name="crown" className={styles.crown} strokeWidth={1.6} />
      <span className={styles.word} aria-hidden="true">
        NOAH
      </span>
      <span className={styles.sub} aria-hidden="true">
        BARBERSHOP
      </span>
    </SectionLink>
  )
}
