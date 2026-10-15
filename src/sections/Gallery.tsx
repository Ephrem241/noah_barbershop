import { useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { Lightbox } from '../components/Lightbox'
import { SectionHeading } from '../components/SectionHeading'
import { useGallery, useShop } from '../content/hooks'
import type { WorkItem } from '../data/barbers'
import { GALLERY_CATEGORIES, type GalleryCategory } from '../data/gallery'
import styles from './Gallery.module.css'

/** Photos shown before "Show all" */
const PAGE = 8

export function Gallery() {
  const { data: gallery, isLoading } = useGallery()
  const { socials } = useShop()
  const [filter, setFilter] = useState<GalleryCategory | 'all'>('all')
  const [expanded, setExpanded] = useState(false)
  const [viewer, setViewer] = useState<number | null>(null)
  const gridRef = useRef<HTMLUListElement>(null)

  // Filters only appear when they'd actually split the photos into groups
  const categories = GALLERY_CATEGORIES.filter((c) => gallery.some((g) => g.category === c.id))
  const active = categories.length >= 2 && categories.some((c) => c.id === filter) ? filter : 'all'
  const filtered = active === 'all' ? gallery : gallery.filter((g) => g.category === active)
  const shown = expanded ? filtered : filtered.slice(0, PAGE)
  const items: WorkItem[] = filtered.map((g) =>
    g.video ? { type: 'video', src: g.video, poster: g.image, alt: g.alt } : { type: 'photo', src: g.image, alt: g.alt },
  )
  const instagram = socials.find((s) => s.icon === 'instagram')
  // Wording stays "photos" until the first clip is uploaded
  const hasVideo = gallery.some((g) => g.video)
  const things = hasVideo ? 'photos and videos' : 'photos'
  const count = (n: number) => (hasVideo ? `${n} ${n === 1 ? 'item' : 'items'}` : `${n} ${n === 1 ? 'photo' : 'photos'}`)

  const choose = (next: GalleryCategory | 'all') => {
    setFilter(next)
    setExpanded(false)
  }

  const closeViewer = () => {
    const index = viewer
    setViewer(null)
    // Back to the tile that was opened (or the last one shown, if the viewer paged past the visible ones)
    requestAnimationFrame(() => {
      const tiles = gridRef.current?.querySelectorAll<HTMLElement>('button[data-index]')
      if (!tiles?.length || index === null) return
      tiles[Math.min(index, tiles.length - 1)].focus()
    })
  }

  if (!isLoading && gallery.length === 0) return null

  return (
    <section id="gallery" className={`section ${styles.gallery}`} aria-labelledby="gallery-title">
      <div className="container">
        <div className={`reveal ${styles.head}`}>
          <SectionHeading id="gallery-title" eyebrow="Our work" title="Styles we cut" />
          <p className={styles.text}>
            Fades, textured cuts, beard work and designs. {hasVideo ? 'Tap a photo or video to open it.' : 'Tap a photo to see it larger.'}
          </p>
        </div>

        {categories.length >= 2 ? (
          <div className={styles.filters} role="group" aria-label={`Filter ${things} by style`}>
            {[{ id: 'all' as const, label: 'All' }, ...categories].map((c) => (
              <button
                key={c.id}
                type="button"
                className={styles.chip}
                aria-pressed={active === c.id}
                onClick={() => choose(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        ) : null}
        <p className="visually-hidden" aria-live="polite">
          {isLoading ? '' : `Showing ${count(filtered.length)}`}
        </p>

        <ul ref={gridRef} className={styles.grid} aria-busy={isLoading} aria-label={`Haircut ${things}`}>
          {isLoading
            ? Array.from({ length: 5 }, (_, i) => <li key={i} className={`skeleton ${styles.tile}`} aria-hidden="true" />)
            : shown.map((item, i) => (
                <li key={item.video ?? item.image} className={styles.tile}>
                  <button
                    type="button"
                    className={styles.open}
                    data-index={i}
                    aria-label={item.video ? `Play video: ${item.alt || 'haircut video'}` : `View larger: ${item.alt || 'haircut photo'}`}
                    onClick={() => setViewer(i)}
                  >
                    <img src={item.image} alt="" width={400} height={500} loading="lazy" decoding="async" />
                    {item.video ? (
                      <span className={styles.play} aria-hidden="true">
                        <Icon name="play" size={18} />
                      </span>
                    ) : (
                      <span className={styles.zoom} aria-hidden="true">
                        <Icon name="expand" size={16} strokeWidth={1.7} />
                      </span>
                    )}
                  </button>
                </li>
              ))}
        </ul>

        {!isLoading && filtered.length === 0 ? (
          <p className={styles.empty}>
            No {hasVideo ? 'photos or videos' : 'photos'} in this style yet.{' '}
            <button type="button" className={styles.more} onClick={() => choose('all')}>
              Show all {things}
            </button>
          </p>
        ) : null}

        <div className={styles.footer}>
          {filtered.length > PAGE && !expanded ? (
            <button type="button" className={styles.more} onClick={() => setExpanded(true)}>
              Show all {filtered.length} {things}
              <Icon name="chevronRight" size={14} strokeWidth={1.8} />
            </button>
          ) : null}
          {instagram ? (
            <a href={instagram.href} target="_blank" rel="noopener noreferrer" className={styles.more}>
              <Icon name="instagram" size={15} strokeWidth={1.7} />
              More on Instagram
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          ) : null}
        </div>
      </div>

      {viewer !== null && items[viewer] ? (
        <Lightbox items={items} index={viewer} label={`Haircut ${things}`} onIndexChange={setViewer} onClose={closeViewer} />
      ) : null}
    </section>
  )
}
