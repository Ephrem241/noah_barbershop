import { BarberCard } from '../booking/BarberCard'
import { useBooking } from '../booking/context'
import { SectionHeading } from '../components/SectionHeading'
import { useBarbers } from '../content/hooks'
import styles from './Barbers.module.css'

export function Barbers() {
  const { data: barbers, isLoading } = useBarbers()
  const { openBooking } = useBooking()

  if (!isLoading && barbers.length === 0) return null

  return (
    <section id="barbers" className="theme-cream section" aria-labelledby="barbers-title">
      <div className="container">
        <div className={`reveal ${styles.head}`}>
          <SectionHeading id="barbers-title" eyebrow="The team" title="Meet the barbers" />
          <p className={styles.text}>
            Open a profile to see each barber’s work and specialties, then call them or request a time.
          </p>
        </div>

        <ul className={styles.grid} aria-busy={isLoading}>
          {isLoading
            ? Array.from({ length: 3 }, (_, i) => <li key={i} className={`skeleton ${styles.skeleton}`} aria-hidden="true" />)
            : barbers.map((barber) => (
                <li key={barber.id}>
                  <BarberCard barber={barber} onSelect={openBooking} />
                </li>
              ))}
        </ul>
      </div>
    </section>
  )
}
