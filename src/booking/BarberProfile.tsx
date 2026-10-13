import type { Ref } from 'react'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import type { Barber } from '../data/barbers'
import { BarberPortrait } from './BarberPortrait'
import { bookingMessage, telegramHref, telHref, whatsappHref } from './contact'
import styles from './BarberProfile.module.css'

type BarberProfileProps = {
  barber: Barber
  headingRef?: Ref<HTMLHeadingElement>
  onOpenMedia: (index: number) => void
  onRequest: () => void
}

export function BarberProfile({ barber, headingRef, onOpenMedia, onRequest }: BarberProfileProps) {
  const { name, phone } = barber
  const photos = barber.work.filter((w) => w.type === 'photo').length
  const videos = barber.work.length - photos
  const meta = [barber.experience, barber.languages?.join(', ')].filter(Boolean)
  const newTab = { target: '_blank', rel: 'noopener noreferrer' }

  return (
    <article className={styles.profile} aria-labelledby="barber-title">
      <div className={styles.header}>
        <div className={styles.portrait}>
          <BarberPortrait barber={barber} />
        </div>

        <div className={styles.info}>
          {barber.placeholder ? <span className={styles.tag}>Sample profile</span> : null}
          <p className="eyebrow">{barber.role}</p>
          <h2 id="barber-title" ref={headingRef} tabIndex={-1} className={styles.name}>
            {name}
          </h2>
          {meta.length ? <p className={styles.meta}>{meta.join(' · ')}</p> : null}
          <p className={styles.bio}>{barber.bio}</p>

          <ul className={styles.chips} aria-label="Specialties">
            {barber.specialties.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <div className={styles.contact}>
            <a href={telHref(phone)} className={styles.phone}>
              <span className={styles.ring}>
                <Icon name="phone" size={14} strokeWidth={1.7} />
              </span>
              <span>
                <span className={styles.number}>{phone}</span>
                <span className={styles.caption}>Direct line</span>
              </span>
            </a>
            <div className={styles.actions}>
              <Button href={telHref(phone)} icon="phone" aria-label={`Call ${name} at ${phone}`}>
                Call {name}
              </Button>
              {barber.telegram ? (
                <Button href={telegramHref(barber.telegram)} variant="secondary" icon="telegram" {...newTab}>
                  Telegram<span className="visually-hidden"> (opens in a new tab)</span>
                </Button>
              ) : null}
              {barber.whatsapp ? (
                <Button
                  href={whatsappHref(barber.whatsapp, bookingMessage(name))}
                  variant="secondary"
                  icon="whatsapp"
                  {...newTab}
                >
                  WhatsApp<span className="visually-hidden"> (opens in a new tab)</span>
                </Button>
              ) : null}
            </div>
            <button type="button" className={styles.request} onClick={onRequest}>
              <Icon name="calendar" size={15} strokeWidth={1.7} />
              Or request a time and we’ll call you
              <Icon name="arrowRight" size={14} strokeWidth={1.7} />
            </button>
          </div>
        </div>
      </div>

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
    </article>
  )
}
