import { useEffect, useRef, type MouseEvent } from 'react'
import { Icon } from '../components/Icon'
import type { WorkItem } from '../data/barbers'
import styles from './MediaViewer.module.css'

type MediaViewerProps = {
  items: WorkItem[]
  index: number
  label: string
  onIndexChange: (index: number) => void
  /** Escape is handled by the parent <dialog>'s cancel event */
  onClose: () => void
}

export function MediaViewer({ items, index, label, onIndexChange, onClose }: MediaViewerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const count = items.length
  const item = items[index]
  const go = (step: number) => onIndexChange((index + step + count) % count)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

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
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.viewer} role="group" aria-roledescription="media viewer" aria-label={label}>
      <div className={styles.stage} onClick={onBackdrop}>
        {item.type === 'photo' ? (
          <img key={item.src} className={styles.media} src={item.src} alt={item.alt} />
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
