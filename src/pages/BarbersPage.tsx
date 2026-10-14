import { Link } from 'react-router-dom'
import { BarberCard } from '../booking/BarberCard'
import { BARBERS_PATH, useBooking } from '../booking/context'
import { TeamNote } from '../booking/TeamNote'
import { useSelectedService } from '../booking/useSelectedService'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { InfoItem } from '../components/InfoItem'
import { useBarbers, useShop } from '../content/hooks'
import { usePageMeta } from '../hooks/usePageMeta'
import styles from './BarbersPage.module.css'

const steps = [
  { title: 'Choose your barber', text: 'See who does what, and pick the barber you’d like.' },
  { title: 'Call or message them', text: 'Straight from their card: phone, WhatsApp or Telegram.' },
  { title: 'Agree on a time', text: 'Your barber tells you what’s free, and you settle the day and time together.' },
]

/** /barbers: every booking button leads here. Customers pick a barber and contact them directly. */
export function BarbersPage() {
  const { data: barbers, isLoading } = useBarbers()
  const { openProfile } = useBooking()
  const { service, clear } = useSelectedService()
  const shop = useShop()
  const hasProfiles = isLoading || barbers.length > 0

  usePageMeta('Choose Your Barber – Noah Barbershop', BARBERS_PATH)

  return (
    <>
      <section className={styles.header} aria-labelledby="choose-title">
        <div className={`container ${styles.headerInner}`}>
          <div className={styles.intro}>
            <p className="eyebrow">Book an appointment</p>
            <h1 id="choose-title" className={styles.title}>
              Choose Your Barber
            </h1>
            <p className={styles.lead}>Your style. Your barber. Your choice.</p>
          </div>

          {hasProfiles ? (
            <div className={styles.how}>
              <ol className={styles.steps}>
                {steps.map((step, i) => (
                  <li key={step.title}>
                    <span className={styles.stepNumber} aria-hidden="true">
                      {i + 1}
                    </span>
                    <div>
                      <p className={styles.stepTitle}>{step.title}</p>
                      <p className={styles.stepText}>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className={styles.notice}>
                <Icon name="chat" size={16} strokeWidth={1.7} />
                <span>
                  Calls and messages go straight to your barber. Sending a message doesn’t confirm a booking: your
                  appointment is set once you’ve agreed on a time together. Walk-ins are welcome too.
                </span>
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className={`theme-cream ${styles.team}`} aria-label="Barbers">
        <div className="container">
          {service ? (
            <div className={styles.service}>
              <div className={styles.serviceInfo}>
                <span className={styles.serviceLabel}>Your service</span>
                <span className={styles.serviceName}>
                  {service.title}
                  <span className={styles.servicePrice}>
                    {service.priceFrom ? ' · from ' : ' · '}
                    {service.price}
                  </span>
                </span>
                <span className={styles.serviceHint}>
                  {hasProfiles
                    ? 'We’ll add it to your WhatsApp message. On a call or on Telegram, just mention it.'
                    : 'Mention it when you call the shop.'}
                </span>
              </div>
              <div className={styles.serviceActions}>
                <Link to={{ pathname: '/', hash: '#services' }} className={styles.serviceLink}>
                  Change<span className="visually-hidden"> service</span>
                </Link>
                <button type="button" className={styles.serviceClear} onClick={clear} aria-label="Clear the selected service">
                  <Icon name="close" size={16} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          ) : null}

          {hasProfiles ? (
            <ul className={styles.grid} aria-busy={isLoading}>
              {isLoading
                ? Array.from({ length: 3 }, (_, i) => (
                    <li key={i} className={`skeleton ${styles.skeleton}`} aria-hidden="true" />
                  ))
                : barbers.map((barber) => (
                    <li key={barber.id} className="reveal">
                      <BarberCard
                        barber={barber}
                        serviceTitle={service?.title}
                        headingLevel="h2"
                        onViewProfile={openProfile}
                      />
                    </li>
                  ))}
            </ul>
          ) : (
            <TeamNote />
          )}
        </div>
      </section>

      <section className={styles.visit} aria-labelledby="visit-title">
        <div className={`container ${styles.visitInner}`}>
          <div className={styles.visitIntro}>
            <p className="eyebrow">Visit us</p>
            <h2 id="visit-title" className={styles.visitTitle}>
              Prefer to just come in?
            </h2>
            <p className={styles.visitText}>Walk-ins are welcome. Contacting your barber ahead helps you avoid a wait.</p>
            <div className={styles.visitActions}>
              <Button href={shop.directionsUrl} icon="navigate" target="_blank" rel="noopener noreferrer">
                Get Directions<span className="visually-hidden"> (opens Google Maps in a new tab)</span>
              </Button>
            </div>
          </div>
          <div className={styles.info}>
            <InfoItem
              icon="pin"
              caption="Address"
              value={[shop.address.line2 ? `${shop.address.line1},` : shop.address.line1, shop.address.line2]}
            />
            <InfoItem icon="clock" caption="Opening hours" value={shop.hours.time} detail={shop.hours.days} />
            <InfoItem icon="phone" caption="Shop phone (calls)" value={shop.phone.display} href={shop.phone.href} />
          </div>
        </div>
      </section>
    </>
  )
}
