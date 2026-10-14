import { BarberCard } from '../booking/BarberCard'
import { BARBERS_PATH, useBooking } from '../booking/context'
import { TeamNote } from '../booking/TeamNote'
import { Button } from '../components/Button'
import { SectionHeading } from '../components/SectionHeading'
import { useBarbers } from '../content/hooks'
import styles from './Barbers.module.css'

export function Barbers() {
  const { data: barbers, isLoading } = useBarbers()
  const { openProfile } = useBooking()
  const hasProfiles = isLoading || barbers.length > 0

  return (
    <section id="barbers" className="theme-cream section" aria-labelledby="barbers-title">
      <div className="container">
        <div className={`reveal ${styles.head}`}>
          <SectionHeading id="barbers-title" eyebrow="The team" title="Meet the barbers" />
          <p className={styles.text}>
            {hasProfiles
              ? 'Pick your barber, then call or message them directly to agree on a time.'
              : 'In our clients’ words: “highly skilled” barbers who “truly listen to what you want.”'}
          </p>
        </div>

        {hasProfiles ? (
          <>
            <ul className={styles.grid} aria-busy={isLoading}>
              {isLoading
                ? Array.from({ length: 3 }, (_, i) => (
                    <li key={i} className={`skeleton ${styles.skeleton}`} aria-hidden="true" />
                  ))
                : barbers.map((barber) => (
                    <li key={barber.id}>
                      <BarberCard barber={barber} onViewProfile={openProfile} />
                    </li>
                  ))}
            </ul>
            <div className={styles.more}>
              <Button to={BARBERS_PATH} variant="secondary" arrow>
                Choose your barber
              </Button>
            </div>
          </>
        ) : (
          <TeamNote />
        )}
      </div>
    </section>
  )
}
