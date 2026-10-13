import { useBookingLink } from '../booking/context'
import { Button } from '../components/Button'
import styles from './Hero.module.css'

export function Hero() {
  const bookLink = useBookingLink()

  return (
    <section id="home" className={styles.hero} aria-labelledby="hero-title">
      <img
        className={styles.image}
        src="/images/hero.jpg"
        alt="A barber in a leather apron giving a client a precise skin fade"
        width={1248}
        height={532}
        fetchPriority="high"
        decoding="async"
      />
      <div className={styles.overlay} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <p className={`eyebrow ${styles.eyebrow}`}>Noah Barbershop</p>
          <h1 id="hero-title" className={styles.title}>
            Precise Fades.
            <br />
            Premium Care.
            <br />
            <span className={styles.accent}>Master Styling.</span>
          </h1>
          <p className={styles.lead}>
            Discover the peak of modern men’s grooming at Addis Ababa’s premier barbershop. Your style is our
            signature statement.
          </p>
          <div className={styles.actions}>
            <Button {...bookLink} icon="calendar">
              Book Your Chair Now
            </Button>
            <Button href="#services" variant="secondary" arrow>
              View Services
            </Button>
          </div>
        </div>
      </div>

      <a href="#why-noah" className={styles.scroll}>
        <span>Scroll Down</span>
        <svg width="9" height="46" viewBox="0 0 9 46" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M4.5 0v44M1 40.5l3.5 4 3.5-4" strokeWidth="1" />
        </svg>
      </a>
    </section>
  )
}
