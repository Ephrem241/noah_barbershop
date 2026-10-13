import { BOOKING_SECTION_ID, useBooking } from '../booking/context'
import { RequestForm } from '../booking/RequestForm'
import { Icon } from '../components/Icon'
import { SectionHeading } from '../components/SectionHeading'
import { openingSummary } from '../content/api'
import { useBarbers, useServices, useShop } from '../content/hooks'
import styles from './Booking.module.css'

export function Booking() {
  const { data: barbers } = useBarbers()
  const { data: services } = useServices()
  const shop = useShop()
  const { prefill } = useBooking()

  const steps = [
    { title: 'Send a request', text: 'Pick a service, barber and preferred time, or leave them open.' },
    { title: 'We call to confirm', text: 'We ring the number you give us to agree on the time.' },
    { title: 'Come in', text: `${shop.address.line1}. ${openingSummary(shop.hours)}.` },
  ]

  return (
    <section id={BOOKING_SECTION_ID} className="theme-ivory section" aria-labelledby="booking-title">
      <div className={`container ${styles.layout}`}>
        <div className={styles.intro}>
          <SectionHeading id="booking-title" eyebrow="Book a visit" title="Request an appointment" />
          <p className={styles.text}>
            Tell us what you’d like and when. A request isn’t a confirmed booking: we’ll call you to confirm the time.
          </p>

          <ol className={styles.steps}>
            {steps.map((step, i) => (
              <li key={step.title}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className={styles.call}>
            Prefer to talk now?
            <a href={shop.phone.href} className={styles.phone}>
              <Icon name="phone" size={16} strokeWidth={1.7} />
              {shop.phone.display}
            </a>
          </p>
        </div>

        <div className={styles.card}>
          <RequestForm variant="inline" barbers={barbers} services={services} shop={shop} prefill={prefill} />
        </div>
      </div>
    </section>
  )
}
