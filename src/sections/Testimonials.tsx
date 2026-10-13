import { Icon } from '../components/Icon'
import { SectionHeading } from '../components/SectionHeading'
import { TestimonialSlider } from '../components/TestimonialSlider'
import { useShop, useTestimonials } from '../content/hooks'
import styles from './Testimonials.module.css'

export function Testimonials() {
  const { data: testimonials, isLoading } = useTestimonials()
  const { tripadvisor } = useShop()

  if (!isLoading && testimonials.length === 0) return null

  return (
    <section id="reviews" className={`section ${styles.section}`} aria-labelledby="reviews-title">
      <div className="container">
        <div className={`reveal ${styles.head}`}>
          <SectionHeading id="reviews-title" eyebrow="Client reviews" title="What clients say" />
          {tripadvisor ? (
            <a href={tripadvisor.url} target="_blank" rel="noopener noreferrer" className={styles.badge}>
              <span className={styles.stars} aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <Icon key={i} name="star" size={13} />
                ))}
              </span>
              <strong>{tripadvisor.rating.toFixed(1)}</strong>
              <span>
                {tripadvisor.count ? `· ${tripadvisor.count} reviews on Tripadvisor` : '· on Tripadvisor'}
              </span>
              <Icon name="external" size={13} strokeWidth={1.8} className={styles.external} />
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          ) : null}
        </div>

        {isLoading ? (
          <div className={styles.skeletons} aria-hidden="true">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className={`skeleton ${styles.skeleton}`} />
            ))}
          </div>
        ) : (
          <TestimonialSlider items={testimonials} />
        )}
      </div>
    </section>
  )
}
