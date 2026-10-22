import { BARBERS_PATH } from '../booking/context'
import { Button } from '../components/Button'
import { SectionHeading } from '../components/SectionHeading'
import { ServiceCard } from '../components/ServiceCard'
import { useServices, useShop } from '../content/hooks'
import styles from './Services.module.css'

export function Services() {
  const { data: services, isLoading } = useServices()
  const shop = useShop()
  const anyFrom = services.some((s) => s.priceFrom)
  const unavailable = !isLoading && services.length === 0

  return (
    <section id="services" className="theme-ivory section" aria-labelledby="services-title">
      <div className="container">
        <div className={`reveal ${styles.head}`}>
          <SectionHeading id="services-title" eyebrow="Services & prices" title="Signature services" />
          <p className={styles.text}>
            Cuts, fades, beards and grooming treatments. Pick a service, then choose your barber and contact them
            directly.
          </p>
        </div>

        {unavailable ? (
          // Prices only ever come from /admin: if they can't load, say so rather than guess
          <p className={styles.unavailable}>
            Our price list couldn’t be loaded right now. Call <a href={shop.phone.href}>{shop.phone.display}</a> for
            prices, or just walk in.
          </p>
        ) : (
          <ul className={styles.grid} aria-busy={isLoading}>
            {isLoading
              ? Array.from({ length: 6 }, (_, i) => (
                  <li key={i}>
                    <div className={`skeleton ${styles.skeleton}`} aria-hidden="true" />
                  </li>
                ))
              : services.map((service) => (
                  <li key={service.id ?? service.title}>
                    <ServiceCard {...service} />
                  </li>
                ))}
          </ul>
        )}

        <div className={styles.footer}>
          {!isLoading && anyFrom ? (
            <p className={styles.note}>Prices in Ethiopian birr. “From” prices are starting prices.</p>
          ) : null}
          <Button to={BARBERS_PATH} variant="secondary" arrow className={styles.cta}>
            Explore Our Barbers
          </Button>
        </div>
      </div>
    </section>
  )
}
