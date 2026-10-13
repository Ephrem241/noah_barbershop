import { SectionHeading } from '../components/SectionHeading'
import { useShop } from '../content/hooks'
import styles from './About.module.css'

// How the shop works, in its own words — kept to what the services and client reviews support.
const principles = [
  {
    title: 'Listen first',
    text: 'A cut starts with a short consultation: the look you want, how you wear your hair and how much upkeep suits you.',
  },
  {
    title: 'Detail in every line',
    text: 'Clean fades, sharp line-ups and careful scissor work, finished properly before you leave the chair.',
  },
  {
    title: 'A clean, welcoming shop',
    text: 'A tidy, comfortable space and friendly staff: the thing our reviewers mention most.',
  },
]

export function About() {
  const { tripadvisor } = useShop()

  return (
    <section id="about" className="theme-ivory section" aria-labelledby="about-title">
      <div className={`container ${styles.layout}`}>
        <div className={`reveal ${styles.intro}`}>
          <SectionHeading id="about-title" eyebrow="About Noah" title="Good cuts start with listening" />
          <p className={styles.text}>
            Noah Barbershop is a men’s barbershop near Edna Mall in Bole, Addis Ababa. Our approach is simple:
            understand what you want, cut it with care, and keep the shop clean and welcoming while we do.
          </p>

          <figure className={styles.quote}>
            <blockquote>
              <p>
                “The shop is very clean, they use high-quality products, and they genuinely care about their clients.”
              </p>
            </blockquote>
            <figcaption>
              Yonatan A. ·{' '}
              {tripadvisor ? (
                <a href={tripadvisor.url} target="_blank" rel="noopener noreferrer">
                  Tripadvisor review<span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              ) : (
                'Tripadvisor review'
              )}
            </figcaption>
          </figure>
        </div>

        <ol className={styles.principles}>
          {principles.map((p, i) => (
            <li key={p.title} className="reveal">
              <span className={styles.number} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.title}>{p.title}</h3>
              <p className={styles.body}>{p.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
