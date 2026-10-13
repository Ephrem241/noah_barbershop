import { Icon, type IconName } from '../components/Icon'
import styles from './Features.module.css'

const features: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'scissors',
    title: 'Expert Stylists',
    text: 'Our barbers are highly skilled professionals continuously trained in global trends and classic techniques.',
  },
  {
    icon: 'bottle',
    title: 'Premium Products',
    text: 'We strictly use top-tier hair treatments, essential oils, and skin products tailored to your needs.',
  },
  {
    icon: 'armchair',
    title: 'Luxe Atmosphere',
    text: 'Unwind in a premium environment designed with your relaxation and absolute comfort in mind.',
  },
]

export function Features() {
  return (
    <section id="why-noah" className={styles.features} aria-labelledby="features-title">
      <div className="container">
        <h2 id="features-title" className="visually-hidden">
          Why choose Noah Barbershop
        </h2>
        <ul className={styles.grid}>
          {features.map((feature) => (
            <li key={feature.title} className={styles.item}>
              <Icon name={feature.icon} size={48} strokeWidth={1.35} className={styles.icon} />
              <div className={styles.copy}>
                <h3 className={styles.title}>{feature.title}</h3>
                <p className={styles.text}>{feature.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
