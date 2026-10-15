import { useRef, useState } from 'react'
import { BARBERS_PATH } from '../booking/context'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { InfoItem } from '../components/InfoItem'
import { SectionHeading } from '../components/SectionHeading'
import { useShop } from '../content/hooks'
import { site } from '../data/site'
import styles from './VisitUs.module.css'

/**
 * Stylized dark street map (illustrative, not to scale): the map until exact coordinates are set in /admin, and the
 * placeholder under the live Google Map while that loads. The street layer stretches to any box with constant
 * stroke widths.
 */
function MapIllustration() {
  return (
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
  )
}

/**
 * Gold pin with its tip on the centre of the map. Google's embed is centred on the shop's coordinates, so on the
 * live map this sits exactly over (and hides) Google's own marker.
 */
function MapMarker() {
  return (
    <span className={styles.marker} aria-hidden="true">
      <span className={styles.pulse} />
      <svg width="34" height="44" viewBox="0 0 34 44">
        <defs>
          <linearGradient id="map-marker-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e8d0a2" />
            <stop offset="1" stopColor="#b48d55" />
          </linearGradient>
        </defs>
        <path
          d="M17 43.5S2 28.9 2 17.5a15 15 0 0 1 30 0C32 28.9 17 43.5 17 43.5z"
          fill="url(#map-marker-gold)"
          stroke="#0c0b0a"
          strokeOpacity="0.4"
        />
        <circle cx="17" cy="17" r="5.5" fill="#141311" />
      </svg>
    </span>
  )
}

/** "Near Edna Mall, Bole" + "Addis Ababa, Ethiopia" → "Near Edna Mall, Bole, Addis Ababa" */
const shortAddress = (line1: string, line2: string) => [line1, line2.replace(/,?\s*Ethiopia$/i, '')].filter(Boolean).join(', ')

/** "Near Edna Mall, Bole, Addis Ababa" → "near Edna Mall, Bole, Addis Ababa" */
function locationPhrase(line1: string, line2: string) {
  const place = shortAddress(line1, line2)
  return /^near\s/i.test(place) ? `near ${place.slice(5)}` : `at ${place}`
}

/** The location card: branded header over a calm, still map that becomes interactive when asked. */
function LocationCard() {
  const shop = useShop()
  const [exploring, setExploring] = useState(false)
  const frameRef = useRef<HTMLIFrameElement>(null)

  const explore = () => {
    setExploring(true)
    // Keyboard users carry on inside the map
    requestAnimationFrame(() => frameRef.current?.focus())
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <img src="/images/logo-mark.webp" alt="" width={104} height={96} className={styles.mark} />
        <div className={styles.place}>
          <p className={styles.placeName}>{site.name}</p>
          <p className={styles.placeAddress}>{shortAddress(shop.address.line1, shop.address.line2)}</p>
        </div>
        <a href={shop.mapsUrl} target="_blank" rel="noopener noreferrer" className={styles.openMaps}>
          <span className={styles.openLabel}>Open in Maps</span>
          <Icon name="external" size={14} strokeWidth={1.8} />
          <span className="visually-hidden"> (Google Maps, opens in a new tab)</span>
        </a>
      </div>

      {shop.mapEmbedUrl ? (
        // Exact pin: a real Google Map, toned to the site. It stays still (so a swipe scrolls the page) until the
        // visitor chooses to explore it; the drawn map underneath shows while it loads, or if it can't.
        <div className={`${styles.map} ${exploring ? styles.exploring : ''}`}>
          <MapIllustration />
          <iframe
            ref={frameRef}
            src={shop.mapEmbedUrl}
            title="Map showing Noah Barbershop’s exact location"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            tabIndex={exploring ? 0 : -1}
            className={styles.mapFrame}
          />
          {exploring ? null : (
            <>
              <MapMarker />
              <button type="button" className={styles.explore} onClick={explore}>
                <span className={styles.explorePill}>
                  <Icon name="expand" size={14} strokeWidth={1.8} />
                  Explore the map
                </span>
              </button>
            </>
          )}
        </div>
      ) : (
        // No coordinates yet: keep the drawn map rather than show a possibly wrong pin
        <a
          href={shop.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.map} ${styles.mapLink}`}
          aria-label="Map: Noah Barbershop. Opens Google Maps directions in a new tab"
        >
          <MapIllustration />
          <MapMarker />
        </a>
      )}
    </div>
  )
}

export function VisitUs() {
  const shop = useShop()

  return (
    <section id="contact" className={`section ${styles.band}`} aria-labelledby="contact-title">
      <div className={`container ${styles.layout}`}>
        <div className={`reveal ${styles.content}`}>
          <SectionHeading id="contact-title" eyebrow="Visit us" title="Find the shop" />
          <p className={styles.text}>
            We’re {locationPhrase(shop.address.line1, shop.address.line2)}. Walk-ins are welcome; contacting your
            barber ahead helps you avoid a wait.
          </p>

          <div className={styles.info}>
            <InfoItem
              icon="pin"
              caption="Address"
              value={[shop.address.line2 ? `${shop.address.line1},` : shop.address.line1, shop.address.line2]}
            />
            <InfoItem icon="clock" caption="Opening hours" value={shop.hours.time} detail={shop.hours.days} />
            <InfoItem icon="phone" caption="Call us" value={shop.phone.display} href={shop.phone.href} />
          </div>

          <div className={styles.actions}>
            <Button href={shop.directionsUrl} icon="navigate" target="_blank" rel="noopener noreferrer">
              Get Directions<span className="visually-hidden"> (opens Google Maps in a new tab)</span>
            </Button>
            <Button to={BARBERS_PATH} variant="secondary" icon="calendar">
              Choose Your Barber
            </Button>
          </div>
        </div>

        <LocationCard />
      </div>
    </section>
  )
}
