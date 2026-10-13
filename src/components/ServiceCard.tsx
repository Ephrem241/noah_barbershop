import { BOOKING_SECTION_ID } from '../booking/context'
import type { Service } from '../data/services'
import { Icon } from './Icon'
import styles from './ServiceCard.module.css'

type ServiceCardProps = Service & {
  /** Called when "Book" is chosen, before the link scrolls to the booking form */
  onBook: () => void
}

/** One line of the services menu: thumbnail, title · price, description, duration and a Book link. */
export function ServiceCard({ title, description, price, priceFrom, duration, image, onBook }: ServiceCardProps) {
  return (
    <article className={styles.item}>
      <div className={styles.thumb}>
        <img src={image} alt="" width={96} height={96} loading="lazy" decoding="async" />
      </div>
      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.title}>{title}</h3>
          <span className={styles.leader} aria-hidden="true" />
          <p className={styles.price}>
            {priceFrom ? <span className={styles.from}>from </span> : null}
            {price}
          </p>
        </div>
        <p className={styles.description}>{description}</p>
        <div className={styles.footer}>
          {duration ? (
            <span className={styles.duration}>
              <Icon name="clock" size={14} strokeWidth={1.7} />
              <span className="visually-hidden">Takes about </span>
              {duration}
            </span>
          ) : null}
          <a href={`#${BOOKING_SECTION_ID}`} className={styles.book} onClick={onBook}>
            Book<span className="visually-hidden"> {title}</span>
            <Icon name="arrowRight" size={14} strokeWidth={1.7} />
          </a>
        </div>
      </div>
    </article>
  )
}
