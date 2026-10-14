import { Button } from '../components/Button'
import { useShop } from '../content/hooks'
import styles from './TeamNote.module.css'

/**
 * Until a barber profile is published in /admin, the team is introduced without inventing names, photos or contact
 * details: a real client review that names a barber, and how to book in the meantime.
 */
export function TeamNote() {
  const shop = useShop()

  return (
    <div className={styles.note}>
      <figure className={styles.quote}>
        <blockquote>
          <p>
            “I had a great experience with Ephrem at Noah Barbershop. His scissor technique is outstanding, very
            detailed, and professional.”
          </p>
        </blockquote>
        <figcaption>
          182abreham ·{' '}
          {shop.tripadvisor ? (
            <a href={shop.tripadvisor.url} target="_blank" rel="noopener noreferrer">
              Tripadvisor review<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          ) : (
            'Tripadvisor review'
          )}
        </figcaption>
      </figure>

      <div>
        <h3 className={styles.title}>Have a barber in mind?</h3>
        <p className={styles.text}>
          Barber profiles are being added. Until then, call the shop and ask for your barber by name, or just walk in.
          No preference? We’ll book you with whoever is free.
        </p>
        <div className={styles.actions}>
          <Button href={shop.phone.href} icon="phone">
            Call the shop
          </Button>
          <Button href={shop.directionsUrl} variant="secondary" icon="navigate" target="_blank" rel="noopener noreferrer">
            Get Directions<span className="visually-hidden"> (opens Google Maps in a new tab)</span>
          </Button>
        </div>
        <p className={styles.phone}>{shop.phone.display}</p>
      </div>
    </div>
  )
}
