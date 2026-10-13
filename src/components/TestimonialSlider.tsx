import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { Testimonial } from '../data/testimonials'
import { initials } from '../utils/initials'
import { Icon } from './Icon'
import styles from './TestimonialSlider.module.css'

type TestimonialSliderProps = { items: Testimonial[]; label?: string }

const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

/**
 * Review cards in a native scroll-snap track: 3 per view on desktop, 2 on tablets, ~1 on phones.
 * Touch swipe and keyboard scrolling come for free; arrows and dots move one page at a time.
 */
export function TestimonialSlider({ items, label = 'Client reviews' }: TestimonialSliderProps) {
  const trackId = useId()
  const trackRef = useRef<HTMLUListElement>(null)
  const [pager, setPager] = useState({ page: 0, pages: 1 })

  /** Pages are groups of whole cards (3 on desktop, 1 on phones), measured from the real card positions. */
  const layout = useCallback(() => {
    const track = trackRef.current
    const cards = track ? ([...track.children] as HTMLElement[]) : []
    if (!track || !cards.length) return null
    const style = getComputedStyle(track)
    const gap = parseFloat(style.columnGap) || 0
    const padding = parseFloat(style.scrollPaddingLeft) || 0
    const cardWidth = cards[0].getBoundingClientRect().width
    const perView = Math.max(1, Math.floor((track.clientWidth - padding + gap + 1) / (cardWidth + gap)))
    const pages = Math.ceil(cards.length / perView)
    const maxScroll = track.scrollWidth - track.clientWidth
    const offsetOf = (page: number) => Math.min(cards[page * perView].offsetLeft - padding, maxScroll)
    return { track, pages, maxScroll, offsetOf }
  }, [])

  const measure = useCallback(() => {
    const l = layout()
    if (!l) return
    let page = 0
    for (let i = 0; i < l.pages; i++) if (l.offsetOf(i) <= l.track.scrollLeft + 4) page = i
    if (l.track.scrollLeft >= l.maxScroll - 2) page = l.pages - 1
    setPager((p) => (p.page === page && p.pages === l.pages ? p : { page, pages: l.pages }))
  }, [layout])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    const resize = new ResizeObserver(onScroll)
    resize.observe(track)
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      track.removeEventListener('scroll', onScroll)
    }
  }, [measure, items.length])

  const goTo = (page: number) => {
    const l = layout()
    if (!l) return
    l.track.scrollTo({ left: l.offsetOf(Math.max(0, Math.min(page, l.pages - 1))), behavior: scrollBehavior() })
  }

  const { page, pages } = pager

  return (
    <div className={styles.slider}>
      <ul id={trackId} ref={trackRef} className={styles.track} tabIndex={0} aria-label={label}>
        {items.map((item, i) => (
          <li key={item.id ?? `${item.name}-${i}`} className={styles.slide}>
            <figure className={styles.card}>
              <span className={styles.mark} aria-hidden="true">
                “
              </span>
              <blockquote className={styles.quote}>
                <p>{item.quote}</p>
              </blockquote>
              <figcaption className={styles.author}>
                {item.avatar ? (
                  <img className={styles.avatar} src={item.avatar} alt="" width={44} height={44} loading="lazy" />
                ) : (
                  <span className={`${styles.avatar} ${styles.monogram}`} aria-hidden="true">
                    {initials(item.name)}
                  </span>
                )}
                <span className={styles.meta}>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.caption}>{item.caption}</span>
                </span>
                <span className={styles.stars} role="img" aria-label={`Rated ${item.rating} out of 5`}>
                  {Array.from({ length: 5 }, (_, s) => (
                    <Icon key={s} name="star" size={12} className={s < item.rating ? styles.starOn : styles.starOff} />
                  ))}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {pages > 1 ? (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Previous reviews"
            aria-controls={trackId}
            disabled={page === 0}
            onClick={() => goTo(page - 1)}
          >
            <Icon name="chevronLeft" size={14} strokeWidth={2} />
          </button>
          <div className={styles.dots}>
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                className={styles.dot}
                aria-label={`Show reviews page ${i + 1} of ${pages}`}
                aria-current={i === page ? 'true' : undefined}
                aria-controls={trackId}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Next reviews"
            aria-controls={trackId}
            disabled={page >= pages - 1}
            onClick={() => goTo(page + 1)}
          >
            <Icon name="chevronRight" size={14} strokeWidth={2} />
          </button>
        </div>
      ) : null}
    </div>
  )
}
