import { useEffect } from 'react'
import { BARBERS_PATH } from '../booking/context'
import { Button } from '../components/Button'
import { useShop } from '../content/hooks'
import styles from './NotFoundPage.module.css'

/**
 * Any path the site doesn't have. Vercel still answers 200 (it's a single-page app), so search engines are told not to
 * index it, and the canonical link is dropped rather than pointing at the homepage.
 */
function useNotFoundMeta() {
  useEffect(() => {
    const previousTitle = document.title
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex'

    document.title = 'Page not found – Noah Barbershop'
    document.head.append(robots)
    canonical?.remove()
    return () => {
      document.title = previousTitle
      robots.remove()
      if (canonical) document.head.append(canonical)
    }
  }, [])
}

export function NotFoundPage() {
  const shop = useShop()
  useNotFoundMeta()

  return (
    <section className={styles.page} aria-labelledby="not-found-title">
      <div className={`container ${styles.inner}`}>
        <p className="eyebrow">Page not found</p>
        <h1 id="not-found-title" className={styles.title}>
          This page doesn’t exist
        </h1>
        <p className={styles.text}>The link may be old or mistyped. Here’s where to go next.</p>
        <div className={styles.actions}>
          <Button to={BARBERS_PATH} arrow>
            Explore Our Barbers
          </Button>
          <Button to="/" variant="secondary">
            Back to the homepage
          </Button>
          <Button href={shop.phone.href} variant="secondary" icon="phone">
            Call {shop.phone.display}
          </Button>
        </div>
      </div>
    </section>
  )
}
