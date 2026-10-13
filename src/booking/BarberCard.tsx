import type { MouseEvent } from 'react'
import { Icon } from '../components/Icon'
import type { Barber } from '../data/barbers'
import { BarberPortrait } from './BarberPortrait'
import { telHref } from './contact'
import { bookingHash } from './context'
import styles from './BarberCard.module.css'

type BarberCardProps = {
  barber: Barber
  onSelect: (barberId: string) => void
}

export function BarberCard({ barber, onSelect }: BarberCardProps) {
  const select = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    onSelect(barber.id)
  }

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <BarberPortrait barber={barber} decorative />
        {barber.placeholder ? <span className={styles.tag}>Sample</span> : null}
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>
          {/* Stretched link: the whole card opens the profile */}
          <a href={bookingHash(barber.id)} className={styles.link} onClick={select}>
            {barber.name}
          </a>
        </h3>
        <p className={styles.role}>{barber.role}</p>
        <ul className={styles.chips} aria-label="Specialties">
          {barber.specialties.slice(0, 2).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <div className={styles.footer}>
          <span className={styles.more} aria-hidden="true">
            View profile
            <Icon name="arrowRight" size={14} strokeWidth={1.7} />
          </span>
          <a href={telHref(barber.phone)} className={styles.call} aria-label={`Call ${barber.name} at ${barber.phone}`}>
            <Icon name="phone" size={15} strokeWidth={1.7} />
          </a>
        </div>
      </div>
    </article>
  )
}
