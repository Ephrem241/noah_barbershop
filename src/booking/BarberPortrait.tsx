import { useState } from 'react'
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
  /** Rendered width, for picking a resized copy (the default fits the barber cards) */
  sizes?: string
  className?: string
}

export function BarberPortrait({
  barber,
  decorative = false,
  priority = false,
  sizes = '(max-width: 599px) 90vw, (max-width: 899px) 50vw, 380px',
  className,
}: BarberPortraitProps) {
  // If a resized copy fails to load (e.g. image resizing switched off in Supabase), fall back to the original upload
  const [failedSrcSet, setFailedSrcSet] = useState<string>()
  const srcSet = barber.photoSrcSet !== failedSrcSet ? barber.photoSrcSet : undefined
  const classes = [styles.portrait, className].filter(Boolean).join(' ')
  if (barber.photo) {
    return (
      <img
        className={classes}
        src={barber.photo}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={decorative ? '' : `Portrait of ${barber.name}`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        onError={srcSet ? () => setFailedSrcSet(srcSet) : undefined}
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
