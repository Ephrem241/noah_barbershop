import { Button } from '../components/Button'
import { Icon, type IconName } from '../components/Icon'
import { SectionHeading } from '../components/SectionHeading'
import { useShop } from '../content/hooks'
import styles from './About.module.css'

export function About() {
  const shop = useShop()
  const facts: { icon: IconName; text: string }[] = [
    { icon: 'clock', text: `Open every day · ${shop.hours.time}` },
    { icon: 'scissors', text: 'Walk-ins always welcome' },
  ]
  if (shop.tripadvisor) facts.push({ icon: 'star', text: `Rated ${shop.tripadvisor.rating.toFixed(1)} on Tripadvisor` })

  return (
    <section id="about" className={styles.band} aria-labelledby="about-title">
      <div className={styles.photo}>
        <img
          src="/images/interior.jpg"
          alt="Inside Noah Barbershop: leather sofa and chairs below the lit NOAH sign"
          width={638}
          height={422}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className={styles.content}>
        <SectionHeading
          id="about-title"
          eyebrow="About Us"
          title={
            <>
              The Barbershop
              <br />
              That Cares
            </>
          }
        />
        <p className={styles.text}>
          Noah Barbershop is more than just a place for a haircut — it’s a lifestyle. We combine modern techniques with
          timeless grooming traditions to give you the best version of yourself.
        </p>
        <ul className={styles.facts}>
          {facts.map((fact) => (
            <li key={fact.text}>
              <span className={styles.factIcon} aria-hidden="true">
                <Icon name={fact.icon} size={15} strokeWidth={1.7} />
              </span>
              {fact.text}
            </li>
          ))}
        </ul>
        {/* TODO: point at an About page once it exists */}
        <Button href="#about" variant="secondary" size="sm" arrow className={styles.cta}>
          Learn More
        </Button>
      </div>
    </section>
  )
}
