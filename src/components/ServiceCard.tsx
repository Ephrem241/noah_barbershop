import { useBookingLink } from '../booking/context'
import type { Service } from '../data/services'
import { Icon } from './Icon'
import styles from './ServiceCard.module.css'

export function ServiceCard({ title, description, price, image, alt }: Service) {
  const bookLink = useBookingLink()

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img src={image} alt={alt} width={540} height={240} loading="lazy" decoding="async" />
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>
          {/* Stretched link: the whole card opens booking; the accessible name stays the title */}
          <a {...bookLink} className={styles.link}>
            {title}
          </a>
        </h3>
        <p className={styles.description}>{description}</p>
        <div className={styles.footer}>
          <span className={styles.price}>
            <span className="visually-hidden">From </span>
            {price}
          </span>
          <Icon name="arrowRight" size={15} strokeWidth={1.6} className={styles.arrow} />
        </div>
      </div>
    </article>
  )
}
