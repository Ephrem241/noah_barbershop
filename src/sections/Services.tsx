import { useBooking } from '../booking/context'
import { SectionHeading } from '../components/SectionHeading'
import { ServiceCard } from '../components/ServiceCard'
import { useServices } from '../content/hooks'
import styles from './Services.module.css'

export function Services() {
  const { data: services, isLoading } = useServices()
  const { prefillRequest } = useBooking()
  const anyFrom = services.some((s) => s.priceFrom)

  return (
    <section id="services" className="theme-ivory section" aria-labelledby="services-title">
      <div className="container">
        <div className={`reveal ${styles.head}`}>
          <SectionHeading id="services-title" eyebrow="Services & prices" title="Signature services" />
          <p className={styles.text}>
            Cuts, fades, beards and grooming treatments. Pick a service to request a time, or choose “Not sure yet”
            in the form and ask us when we call.
          </p>
        </div>

        <ul className={styles.grid} aria-busy={isLoading}>
          {isLoading
            ? Array.from({ length: 6 }, (_, i) => (
                <li key={i}>
                  <div className={`skeleton ${styles.skeleton}`} aria-hidden="true" />
                </li>
              ))
            : services.map((service) => (
                <li key={service.id ?? service.title}>
                  <ServiceCard
                    {...service}
                    onBook={() => service.id && prefillRequest({ serviceId: service.id })}
                  />
                </li>
              ))}
        </ul>

        {!isLoading && anyFrom ? (
          <p className={styles.note}>Prices in Ethiopian birr. “From” prices are starting prices.</p>
        ) : null}
      </div>
    </section>
  )
}
