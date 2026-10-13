import { useEffect, useRef, useState } from 'react'
import { BOOKING_SECTION_ID } from '../booking/context'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { openingSummary } from '../content/api'
import { useShop } from '../content/hooks'
import styles from './Hero.module.css'

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } }

export function Hero() {
  const shop = useShop()
  const { tripadvisor } = shop
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  // Background footage plays only when motion is welcome and the visitor isn't saving data; otherwise the poster
  // stays and, with preload="none", no video is downloaded at all.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData
    if (reducedMotion || saveData) return
    video.muted = true
    video.play().catch(() => {}) // autoplay blocked: the poster stays
  }, [])

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play().catch(() => {})
    else video.pause()
  }

  return (
    <section id="home" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.media}>
        {/* Shop footage; to replace it, see "Hero video" in docs/ADMIN_SETUP.md */}
        <video
          ref={videoRef}
          className={styles.image}
          poster="/images/hero-poster.jpg"
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <source src="/videos/hero-480.mp4" type="video/mp4" media="(max-width: 767px)" />
          <source src="/videos/hero-720.mp4" type="video/mp4" />
        </video>
      </div>

      <button
        type="button"
        className={styles.playback}
        aria-label={playing ? 'Pause background video' : 'Play background video'}
        onClick={togglePlayback}
      >
        <Icon name={playing ? 'pause' : 'play'} size={16} />
      </button>

      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <p className="eyebrow">Barbershop · Bole, Addis Ababa</p>
          <h1 id="hero-title" className={styles.title}>
            <span className={styles.line}>Sharp cuts.</span> <span className={styles.line}>Clean fades.</span>{' '}
            <span className={`${styles.line} ${styles.accent}`}>Real care.</span>
          </h1>
          <p className={styles.lead}>
            A clean, welcoming barbershop near Edna Mall. Tell us the look you want and we’ll take the time to get it
            right.
          </p>
          <div className={styles.actions}>
            <Button href={`#${BOOKING_SECTION_ID}`} icon="calendar">
              Book Your Cut
            </Button>
            <Button href={shop.directionsUrl} variant="secondary" icon="navigate" target="_blank" rel="noopener noreferrer">
              Get Directions<span className="visually-hidden"> (opens Google Maps in a new tab)</span>
            </Button>
          </div>

          <ul className={styles.meta}>
            {tripadvisor ? (
              <li>
                <a href={tripadvisor.url} target="_blank" rel="noopener noreferrer" className={styles.rating}>
                  <span className={styles.stars} aria-hidden="true">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Icon key={i} name="star" size={13} />
                    ))}
                  </span>
                  <span>
                    <strong>{tripadvisor.rating.toFixed(1)}</strong>
                    {tripadvisor.count ? ` · ${tripadvisor.count} Tripadvisor reviews` : ' on Tripadvisor'}
                  </span>
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            ) : null}
            <li>
              <Icon name="clock" size={15} strokeWidth={1.7} className={styles.metaIcon} />
              {openingSummary(shop.hours)}
            </li>
            <li>
              <Icon name="scissors" size={15} strokeWidth={1.6} className={styles.metaIcon} />
              Walk-ins welcome
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
