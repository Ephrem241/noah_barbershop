import type { MouseEvent } from 'react'
import { Icon } from '../components/Icon'
import type { Barber } from '../data/barbers'
import { BarberPortrait } from './BarberPortrait'
import { ContactActions } from './ContactActions'
import { profileHash } from './context'
import styles from './BarberCard.module.css'

type BarberCardProps = {
  barber: Barber
  /** Service picked on the website, named in the WhatsApp message */
  serviceTitle?: string
  /** h2 on the /barbers page, h3 inside a homepage section */
  headingLevel?: 'h2' | 'h3'
  /** Load the portrait eagerly, at high priority (the first card at the top of a page) */
  priority?: boolean
  onViewProfile: (barberId: string) => void
}

export function BarberCard({
  barber,
  serviceTitle,
  headingLevel: Heading = 'h3',
  priority = false,
  onViewProfile,
}: BarberCardProps) {
  const titleId = `barber-${barber.id}-name`

  // A plain click opens the profile over the page; modified clicks keep the link's default (e.g. a new tab)
  const view = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    onViewProfile(barber.id)
  }

  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <div className={styles.media}>
        <BarberPortrait barber={barber} decorative priority={priority} />
      </div>
      <div className={styles.body}>
        {barber.role ? <p className={styles.role}>{barber.role}</p> : null}
        <Heading id={titleId} className={styles.name}>
          {barber.name}
        </Heading>
        {barber.bio ? <p className={styles.bio}>{barber.bio}</p> : null}
        {barber.specialties.length ? (
          <ul className={styles.chips} aria-label="Specialties">
            {barber.specialties.slice(0, 4).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        ) : null}

        <ContactActions barber={barber} serviceTitle={serviceTitle} className={styles.contact} />

        <a href={profileHash(barber.id)} className={styles.more} onClick={view}>
          {barber.work.length ? 'View profile & work' : 'View profile'}
          <span className="visually-hidden">: {barber.name}</span>
          <Icon name="arrowRight" size={14} strokeWidth={1.7} />
        </a>
      </div>
    </article>
  )
}
