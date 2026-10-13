import { Button } from '../components/Button'
import { SectionHeading } from '../components/SectionHeading'
import { useGallery } from '../content/hooks'
import styles from './Gallery.module.css'

export function Gallery() {
  const { data: gallery, isLoading } = useGallery()

  return (
    <section id="gallery" className={styles.gallery} aria-labelledby="gallery-title">
      <div className={`container ${styles.layout}`}>
        <div className={styles.intro}>
          <SectionHeading id="gallery-title" eyebrow="Our Gallery" title="Signature Styles" />
          <p className={styles.text}>
            Explore our latest haircuts and grooming styles. Find the look that fits your personality.
          </p>
          {/* TODO: point at a full gallery page or the shop's Instagram once available */}
          <Button href="#gallery" variant="secondary" size="sm" arrow className={styles.cta}>
            View Full Gallery
          </Button>
        </div>

        <ul className={styles.strip} aria-label="Recent haircuts">
          {isLoading
            ? Array.from({ length: 5 }, (_, i) => <li key={i} className={`skeleton ${styles.tile}`} aria-hidden="true" />)
            : gallery.slice(0, 5).map((item) => (
                <li key={item.image} className={styles.tile}>
                  <img src={item.image} alt={item.alt} width={321} height={363} loading="lazy" decoding="async" />
                </li>
              ))}
        </ul>
      </div>
    </section>
  )
}
