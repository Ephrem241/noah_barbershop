import { Button } from '../components/Button'
import { SectionHeading } from '../components/SectionHeading'
import { ServiceCard } from '../components/ServiceCard'
import { useServices } from '../content/hooks'
import styles from './Services.module.css'

export function Services() {
  const { data: services, isLoading } = useServices()

  return (
    <section id="services" className={styles.services} aria-labelledby="services-title">
      <div className={`container ${styles.layout}`}>
        <div className={styles.intro}>
          <SectionHeading id="services-title" eyebrow="Our Services" title="More Than Just a Haircut" />
          <p className={styles.text}>
            From classic cuts to luxury treatments, we offer a complete grooming experience for the modern man.
          </p>
          {/* TODO: point at a full services/price-list page once it exists */}
          <Button href="#services" variant="secondary" size="sm" arrow className={styles.cta}>
            View All Services
          </Button>
        </div>

        <ul className={styles.grid} aria-busy={isLoading}>
          {isLoading
            ? Array.from({ length: 6 }, (_, i) => (
                <li key={i}>
                  <div className={`skeleton ${styles.cardSkeleton}`} aria-hidden="true" />
                </li>
              ))
            : services.map((service) => (
                <li key={service.id ?? service.title}>
                  <ServiceCard {...service} />
                </li>
              ))}
        </ul>
      </div>
    </section>
  )
}
