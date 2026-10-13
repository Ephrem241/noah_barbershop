import { useBookingLink } from '../booking/context'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { InfoItem } from '../components/InfoItem'
import { SectionHeading } from '../components/SectionHeading'
import { useShop } from '../content/hooks'
import styles from './VisitUs.module.css'

/**
 * Stylized dark street map (illustrative, not to scale). The street layer stretches to any box with
 * constant stroke widths; the pin and label are HTML so they keep their size at every breakpoint.
 */
function MapIllustration() {
  return (
    <>
      <svg viewBox="0 0 320 248" preserveAspectRatio="none" aria-hidden="true" className={styles.mapSvg}>
        <g stroke="#1d232b" strokeWidth="0.75" fill="none">
          <path
            vectorEffect="non-scaling-stroke"
            d="M0 46 320 28M0 100 320 82M0 154 320 138M0 208 320 194M60 0 77 248M128 0 146 248M206 0 222 248M272 0 286 248M0 150 200 0M120 248 320 160M0 40 50 0"
          />
        </g>
        <g stroke="#232a33" strokeWidth="1.1" fill="none">
          <path
            vectorEffect="non-scaling-stroke"
            d="M0 22 320 4M0 70 320 52M0 182 320 166M0 236 320 222M28 0 46 248M92 0 112 248M238 0 254 248M300 0 314 248M60 248 320 118M0 96 110 0"
          />
        </g>
        <g stroke="#2a323d" strokeWidth="3.5" fill="none" strokeLinecap="round">
          <path vectorEffect="non-scaling-stroke" d="M-4 128 324 110M168 -4 188 252M-4 214 256 -4" />
        </g>
      </svg>
      <span className={styles.pin} aria-hidden="true">
        <svg width="20" height="26" viewBox="0 0 20 26">
          <circle cx="10" cy="11" r="10" fill="#e53935" opacity="0.16" />
          <path d="M10 25s-8.5-8.6-8.5-14.6a8.5 8.5 0 0 1 17 0c0 6-8.5 14.6-8.5 14.6z" fill="#e53935" />
          <circle cx="10" cy="10.6" r="3" fill="#161b21" />
        </svg>
        <span className={styles.pinLabel}>Noah Barbershop</span>
      </span>
    </>
  )
}

/** "Near Edna Mall, Bole" + "Addis Ababa, Ethiopia" → "near Edna Mall, Bole, Addis Ababa" */
function locationPhrase(line1: string, line2: string) {
  const place = [line1, line2.replace(/,?\s*Ethiopia$/i, '')].filter(Boolean).join(', ')
  return /^near\s/i.test(place) ? `near ${place.slice(5)}` : `at ${place}`
}

export function VisitUs() {
  const bookLink = useBookingLink()
  const shop = useShop()

  return (
    <section id="contact" className={styles.band} aria-labelledby="contact-title">
      <div className={styles.content}>
        <SectionHeading id="contact-title" size="sm" eyebrow="Get in Touch" title="Visit Us" />
        <p className={styles.text}>
          We’re located {locationPhrase(shop.address.line1, shop.address.line2)}. Walk-ins are always welcome, but
          booking an appointment is recommended to avoid wait times.
        </p>

        <div className={styles.info}>
          <InfoItem icon="phone" value={shop.phone.display} caption="Call us" href={shop.phone.href} />
          <InfoItem
            icon="pin"
            value={[shop.address.line2 ? `${shop.address.line1},` : shop.address.line1, shop.address.line2]}
            caption="Our Location"
          />
          <InfoItem icon="clock" value={shop.hours.time} detail={shop.hours.days} caption="Opening Hours" />
        </div>

        <div className={styles.actions}>
          <Button {...bookLink} size="sm" arrow>
            Book Appointment
          </Button>
          <a href={shop.directionsUrl} target="_blank" rel="noopener noreferrer" className={styles.directions}>
            <Icon name="pin" size={15} strokeWidth={1.7} className={styles.gold} />
            Get Directions
            <span className="visually-hidden"> (opens Google Maps navigation in a new tab)</span>
          </a>
        </div>
      </div>

      {shop.mapEmbedUrl ? (
        // Exact pin: a real (darkened) Google Map
        <div className={`${styles.map} ${styles.liveMap}`}>
          <iframe
            src={shop.mapEmbedUrl}
            title="Map showing Noah Barbershop’s exact location"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className={styles.mapFrame}
          />
          <a href={shop.mapsUrl} target="_blank" rel="noopener noreferrer" className={styles.mapChip}>
            Open in Google Maps
            <Icon name="external" size={13} strokeWidth={1.8} />
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </div>
      ) : (
        // No coordinates yet: keep the drawn map rather than show a possibly wrong pin
        <a
          href={shop.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.map}
          aria-label="Map: Noah Barbershop. Opens Google Maps directions in a new tab"
        >
          <MapIllustration />
        </a>
      )}

      <div className={styles.storefront}>
        <img
          src="/images/storefront.jpg"
          alt="Noah Barbershop storefront with gold signage, a barber pole and a sidewalk sign"
          width={634}
          height={428}
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  )
}
