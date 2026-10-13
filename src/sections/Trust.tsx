import { Icon, type IconName } from '../components/Icon'
import { useShop } from '../content/hooks'
import styles from './Trust.module.css'

// What clients say most often in the shop's Tripadvisor reviews — no claims beyond what reviewers wrote.
const highlights: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'sparkle',
    title: 'Clean & welcoming',
    text: 'Reviewers keep coming back to it: a clean shop with friendly, professional staff.',
  },
  {
    icon: 'scissors',
    title: 'Detail in every cut',
    text: 'Precise fades, sharp line-ups and careful scissor work, finished with attention to detail.',
  },
  {
    icon: 'chat',
    title: 'We listen first',
    text: 'Tell us the look you want before we start. One reviewer: they “truly listen to what you want.”',
  },
]

export function Trust() {
  const { tripadvisor } = useShop()

  return (
    <section className={styles.trust} aria-labelledby="trust-title">
      <div className={`container ${styles.layout}`}>
        <h2 id="trust-title" className="visually-hidden">
          Why clients choose Noah Barbershop
        </h2>

        {tripadvisor ? (
          <a href={tripadvisor.url} target="_blank" rel="noopener noreferrer" className={styles.rating}>
            <span className={styles.score}>{tripadvisor.rating.toFixed(1)}</span>
            <span className={styles.ratingText}>
              <span className={styles.stars} role="img" aria-label={`Rated ${tripadvisor.rating.toFixed(1)} out of 5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Icon key={i} name="star" size={14} />
                ))}
              </span>
              <span>
                {tripadvisor.count ? `${tripadvisor.count} reviews on Tripadvisor` : 'On Tripadvisor'}
                <Icon name="external" size={13} strokeWidth={1.8} className={styles.external} />
                <span className="visually-hidden"> (opens in a new tab)</span>
              </span>
            </span>
          </a>
        ) : null}

        <ul className={styles.grid}>
          {highlights.map((item) => (
            <li key={item.title} className={styles.item}>
              <Icon name={item.icon} size={22} strokeWidth={1.4} className={styles.icon} />
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.text}>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
