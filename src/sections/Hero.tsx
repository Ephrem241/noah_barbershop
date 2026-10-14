import { useEffect, useRef, useState } from 'react'
import { BARBERS_PATH } from '../booking/context'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { openingSummary } from '../content/api'
import { useShop } from '../content/hooks'
import styles from './Hero.module.css'

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }

/** The lighter 480p cut for phones and slow connections, 720p otherwise. */
function videoSource() {
  const effectiveType = (navigator as NavigatorWithConnection).connection?.effectiveType ?? ''
  const small = window.matchMedia('(max-width: 767px)').matches || /2g|3g/.test(effectiveType)
  return small ? '/videos/hero-480.mp4' : '/videos/hero-720.mp4'
}

/** Loads the footage on first use (nothing is downloaded before that) and plays it muted. */
function startVideo(video: HTMLVideoElement) {
  if (!video.getAttribute('src')) video.src = videoSource()
  video.muted = true
  video.play().catch(() => {}) // autoplay blocked (e.g. battery saver): the poster stays and the button offers Play
}

/** Calls back once the page has finished loading and the browser is idle, so the footage never delays the first paint. */
function whenPageSettled(callback: () => void) {
  let idle = 0
  let timer = 0
  const schedule = () => {
    // Safari before 18 has no requestIdleCallback
    if (typeof window.requestIdleCallback === 'function') idle = window.requestIdleCallback(callback, { timeout: 2000 })
    else timer = window.setTimeout(callback, 300)
  }
  if (document.readyState === 'complete') schedule()
  else window.addEventListener('load', schedule, { once: true })
  return () => {
    window.removeEventListener('load', schedule)
    if (idle) window.cancelIdleCallback(idle)
    if (timer) window.clearTimeout(timer)
  }
}

export function Hero() {
  const shop = useShop()
  const { tripadvisor } = shop
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  /** 'auto' until the visitor uses the play/pause button; their choice then wins over the defaults */
  const intentRef = useRef<'auto' | 'play' | 'pause'>('auto')
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)

  // Background footage starts after the page has settled, only while the hero is on screen, and by default only
  // when motion is welcome and the visitor isn't saving data. Otherwise the poster stays and nothing is downloaded.
  useEffect(() => {
    const video = videoRef.current
    const section = sectionRef.current
    if (!video || !section) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const saveData = Boolean((navigator as NavigatorWithConnection).connection?.saveData)
    let settled = false
    let onScreen = true

    const sync = () => {
      const intent = intentRef.current
      const wanted = intent === 'play' || (intent === 'auto' && settled && !reducedMotion.matches && !saveData)
      if (wanted && onScreen) {
        if (video.paused) startVideo(video)
      } else if (!video.paused) {
        video.pause()
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })
    observer.observe(section)
    reducedMotion.addEventListener('change', sync)
    const cancelSettled = whenPageSettled(() => {
      settled = true
      sync()
    })
    return () => {
      observer.disconnect()
      reducedMotion.removeEventListener('change', sync)
      cancelSettled()
    }
  }, [])

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      intentRef.current = 'play'
      startVideo(video)
    } else {
      intentRef.current = 'pause'
      video.pause()
    }
  }

  return (
    <section ref={sectionRef} id="home" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.media}>
        {/* Shop footage (its source is chosen in startVideo); to replace it, see "Hero video" in docs/ADMIN_SETUP.md */}
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
          onError={() => setFailed(true)}
        />
      </div>

      {/* If the footage can't load, the poster stays and there's nothing to play or pause */}
      {failed ? null : (
        <button
          type="button"
          className={styles.playback}
          aria-label={playing ? 'Pause background video' : 'Play background video'}
          onClick={togglePlayback}
        >
          <Icon name={playing ? 'pause' : 'play'} size={16} />
        </button>
      )}

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
            <Button to={BARBERS_PATH} icon="calendar">
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
