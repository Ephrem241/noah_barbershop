import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { useShop } from '../content/hooks'
import type { Barber } from '../data/barbers'
import { contactLinks, type ContactLinks } from './contact'
import styles from './ContactActions.module.css'

type ContactActionsProps = {
  barber: Barber
  /** Service picked on the website: named in the WhatsApp message */
  serviceTitle?: string
  className?: string
}

const newTab = { target: '_blank', rel: 'noopener noreferrer' } as const

/** Which methods are missing, in a few words; null when all three are there. */
function availability({ call, whatsapp, telegram }: ContactLinks) {
  if (call && whatsapp && telegram) return null
  if (!call) return whatsapp && telegram ? 'Messages only' : `${whatsapp ? 'WhatsApp' : 'Telegram'} only`
  if (!whatsapp && !telegram) return 'Calls only'
  return `Not on ${whatsapp ? 'Telegram' : 'WhatsApp'}`
}

/**
 * Call / WhatsApp / Telegram straight to the barber. Only valid details become links (src/booking/contact.ts); a
 * missing method has no button, and a short note says what's missing.
 */
export function ContactActions({ barber, serviceTitle, className }: ContactActionsProps) {
  const shop = useShop()
  const links = contactLinks(barber, serviceTitle)
  const { call, whatsapp, telegram } = links
  const classes = [styles.contact, className].filter(Boolean).join(' ')

  // No public contact for this barber: the shop's line, labelled as such (never shown as the barber's own number)
  if (!call && !whatsapp && !telegram) {
    return (
      <div className={classes}>
        <Button href={shop.phone.href} variant="secondary" icon="phone" className={styles.shop}>
          Call the shop<span className="visually-hidden"> to book with {barber.name}</span>
        </Button>
        <p className={styles.details}>Ask for {barber.name} at {shop.phone.display}</p>
      </div>
    )
  }

  const note = availability(links)

  return (
    <div className={classes}>
      <ul className={styles.actions}>
        {call ? (
          <li>
            <a href={call.href} className={`${styles.action} ${styles.primary}`}>
              <Icon name="phone" size={18} strokeWidth={1.7} />
              <span>
                Call<span className="visually-hidden"> {barber.name}, {call.number}</span>
              </span>
            </a>
          </li>
        ) : null}
        {whatsapp ? (
          <li>
            <a href={whatsapp.href} className={styles.action} {...newTab}>
              <Icon name="whatsapp" size={18} strokeWidth={1.6} />
              <span>
                WhatsApp<span className="visually-hidden"> {barber.name} (opens in a new tab)</span>
              </span>
            </a>
          </li>
        ) : null}
        {telegram ? (
          <li>
            <a href={telegram.href} className={styles.action} {...newTab}>
              <Icon name="telegram" size={18} strokeWidth={1.6} />
              <span>
                Telegram<span className="visually-hidden"> {barber.name}, {telegram.handle} (opens in a new tab)</span>
              </span>
            </a>
          </li>
        ) : null}
      </ul>
      {call || note ? (
        <p className={styles.details}>
          {/* Shown as text too: a desktop browser often can't place the call */}
          {call ? <span className={styles.number}>{call.number}</span> : null}
          {note ? <span className={styles.note}>{note}</span> : null}
        </p>
      ) : null}
    </div>
  )
}
