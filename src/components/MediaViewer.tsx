import { useEffect, useRef, type MouseEvent, type PointerEvent } from 'react'
import { Icon } from './Icon'
import type { WorkItem } from '../data/barbers'
import styles from './MediaViewer.module.css'

type MediaViewerProps = {
  items: WorkItem[]
  index: number
  label: string
  onIndexChange: (index: number) => void
  /** Escape is handled by the parent <dialog>'s cancel event (BookingDialog, Lightbox) */
  onClose: () => void
}

/** A horizontal finger movement at least this long (px) pages to the next or previous item */
const SWIPE_MIN = 48

export function MediaViewer({ items, index, label, onIndexChange, onClose }: MediaViewerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const swipeRef = useRef<{ id: number; x: number; y: number } | null>(null)
  const swipedRef = useRef(false)
  const count = items.length
  const item = items[index]
  const go = (step: number) => onIndexChange((index + step + count) % count)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  // Warm the cache for the neighbours, so paging through feels instant
  useEffect(() => {
    if (count < 2) return
    for (const step of [1, -1]) {
      const near = items[(index + step + count) % count]
      new Image().src = near.type === 'photo' ? near.src : near.poster
    }
  }, [items, index, count])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Arrow keys seek inside a focused video; only page through items otherwise
      if (e.target instanceof HTMLVideoElement) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        onIndexChange((index - 1 + count) % count)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        onIndexChange((index + 1) % count)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [index, count, onIndexChange])

  const onBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if (swipedRef.current) {
      swipedRef.current = false // the end of a swipe, not a tap on the backdrop
      return
    }
    if (e.target === e.currentTarget) onClose()
  }

  // Touch swipe left / right (mouse users have the arrow buttons and keys; video controls keep their own gestures)
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    swipedRef.current = false
    if (e.pointerType === 'mouse' || count < 2 || e.target instanceof HTMLVideoElement) return
    swipeRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current
    swipeRef.current = null
    if (!start || start.id !== e.pointerId) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swipedRef.current = true
      go(dx < 0 ? 1 : -1)
    }
  }

  return (
    <div className={styles.viewer} role="group" aria-roledescription="media viewer" aria-label={label}>
      <div
        className={styles.stage}
        onClick={onBackdrop}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipeRef.current = null
        }}
      >
        {item.type === 'photo' ? (
          <img key={item.src} className={styles.media} src={item.src} alt={item.alt} draggable={false} />
        ) : (
          <video
            key={`${item.src}-${index}`}
            className={styles.media}
            src={item.src}
            poster={item.poster}
            aria-label={item.alt}
            controls
            autoPlay
            playsInline
            preload="metadata"
          />
        )}
      </div>

      <p className={styles.caption} aria-live="polite">
        <span>{item.alt}</span>
        <span className={styles.counter}>
          {index + 1} / {count}
        </span>
      </p>

      <button ref={closeRef} type="button" className={`${styles.button} ${styles.close}`} aria-label="Close viewer" onClick={onClose}>
        <Icon name="close" size={20} />
      </button>
      {count > 1 ? (
        <>
          <button type="button" className={`${styles.button} ${styles.prev}`} aria-label="Previous item" onClick={() => go(-1)}>
            <Icon name="chevronLeft" size={18} strokeWidth={2} />
          </button>
          <button type="button" className={`${styles.button} ${styles.next}`} aria-label="Next item" onClick={() => go(1)}>
            <Icon name="chevronRight" size={18} strokeWidth={2} />
          </button>
        </>
      ) : null}
    </div>
  )
}
