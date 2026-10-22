import { Link } from 'react-router-dom'
import { barbersPath } from '../booking/context'
import type { Service } from '../data/services'
import { Icon } from './Icon'
import styles from './ServiceCard.module.css'

/**
 * One line of the services menu: thumbnail (once a photo is uploaded), title · price, description, duration and a Book
 * link, which opens the barber choice with this service selected (/barbers?service=…).
 */
export function ServiceCard({ title, description, price, priceFrom, duration, image }: Service) {
  return (
    <article className={`${styles.item} ${image ? '' : styles.textOnly}`}>
      {image ? (
        <div className={styles.thumb}>
          <img src={image} alt="" width={96} height={96} loading="lazy" decoding="async" />
        </div>
      ) : null}
      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.title}>{title}</h3>
          <span className={styles.leader} aria-hidden="true" />
          <p className={styles.price}>
            {priceFrom ? <span className={styles.from}>from </span> : null}
            {price}
          </p>
        </div>
        {description ? <p className={styles.description}>{description}</p> : null}
        <div className={styles.footer}>
          {duration ? (
            <span className={styles.duration}>
              <Icon name="clock" size={14} strokeWidth={1.7} />
              <span className="visually-hidden">Takes about </span>
              {duration}
            </span>
          ) : null}
          <Link to={barbersPath(title)} className={styles.book}>
            Book<span className="visually-hidden"> {title}</span>
            <Icon name="arrowRight" size={14} strokeWidth={1.7} />
          </Link>
        </div>
      </div>
    </article>
  )
}
