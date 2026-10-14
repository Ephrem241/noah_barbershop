import type { Ref } from 'react'
import { Icon } from '../components/Icon'
import type { Barber } from '../data/barbers'
import { BarberPortrait } from './BarberPortrait'
import { ContactActions } from './ContactActions'
import styles from './BarberProfile.module.css'

type BarberProfileProps = {
  barber: Barber
  /** Service picked on the website, named in the WhatsApp message */
  serviceTitle?: string
  headingRef?: Ref<HTMLHeadingElement>
  onOpenMedia: (index: number) => void
}

export function BarberProfile({ barber, serviceTitle, headingRef, onOpenMedia }: BarberProfileProps) {
  const { name } = barber
  const photos = barber.work.filter((w) => w.type === 'photo').length
  const videos = barber.work.length - photos
  const meta = [barber.experience, barber.languages?.join(', ')].filter(Boolean)

  return (
    <article className={styles.profile} aria-labelledby="barber-title">
      <div className={styles.header}>
        <div className={styles.portrait}>
          <BarberPortrait barber={barber} />
        </div>

        <div className={styles.info}>
          {barber.role ? <p className="eyebrow">{barber.role}</p> : null}
          <h2 id="barber-title" ref={headingRef} tabIndex={-1} className={styles.name}>
            {name}
          </h2>
          {meta.length ? <p className={styles.meta}>{meta.join(' · ')}</p> : null}
          <p className={styles.bio}>{barber.bio}</p>

          {barber.specialties.length ? (
            <ul className={styles.chips} aria-label="Specialties">
              {barber.specialties.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : null}

          <div className={styles.contact}>
            <h3 className={styles.contactTitle}>Book with {name}</h3>
            <p className={styles.contactText}>
              Call or message {name} directly to agree on a day and time. Your appointment is set once you’ve agreed
              on a time together.
            </p>
            <ContactActions barber={barber} serviceTitle={serviceTitle} className={styles.actions} />
          </div>
        </div>
      </div>

      {barber.work.length ? (
        <section className={styles.work} aria-labelledby="work-title">
          <div className={styles.workHead}>
            <h3 id="work-title" className={styles.workTitle}>
              {name}’s work
            </h3>
            <p className={styles.count}>
              {photos} {photos === 1 ? 'photo' : 'photos'}
              {videos ? ` · ${videos} ${videos === 1 ? 'video' : 'videos'}` : ''}
            </p>
          </div>
          <ul className={styles.grid}>
            {barber.work.map((item, i) => (
              <li key={`${item.src}-${i}`}>
                <button
                  type="button"
                  className={styles.tile}
                  data-work-index={i}
                  aria-label={`${item.type === 'video' ? 'Play video' : 'View photo'}: ${item.alt}`}
                  onClick={() => onOpenMedia(i)}
                >
                  <img
                    src={item.type === 'video' ? item.poster : item.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  {item.type === 'video' ? (
                    <span className={styles.play} aria-hidden="true">
                      <Icon name="play" size={18} />
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  )
}
