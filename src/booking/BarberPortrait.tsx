import { Icon } from '../components/Icon'
import type { Barber } from '../data/barbers'
import { initials } from '../utils/initials'
import styles from './BarberPortrait.module.css'

type BarberPortraitProps = {
  barber: Barber
  /** In cards the name sits right below, so the image needs no alt text there */
  decorative?: boolean
  /** Above the fold: load right away, at high priority */
  priority?: boolean
  className?: string
}

export function BarberPortrait({ barber, decorative = false, priority = false, className }: BarberPortraitProps) {
  const classes = [styles.portrait, className].filter(Boolean).join(' ')
  if (barber.photo) {
    return (
      <img
        className={classes}
        src={barber.photo}
        alt={decorative ? '' : `Portrait of ${barber.name}`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
      />
    )
  }
  return (
    <div
      className={`${classes} ${styles.monogram}`}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : `${barber.name} (photo coming soon)`}
      aria-hidden={decorative || undefined}
    >
      <Icon name="crown" className={styles.crown} />
      <span className={styles.initials}>{initials(barber.name)}</span>
    </div>
  )
}
