import { useEffect, useRef, type SyntheticEvent } from 'react'
import type { WorkItem } from '../data/barbers'
import { MediaViewer } from './MediaViewer'
import styles from './Lightbox.module.css'

type LightboxProps = {
  items: WorkItem[]
  index: number
  label: string
  onIndexChange: (index: number) => void
  /** The caller unmounts the lightbox and puts focus back where it came from */
  onClose: () => void
}

/** Full-screen photo/video viewer in a native modal <dialog>: top layer, focus containment and Escape for free. */
export function Lightbox({ items, index, label, onIndexChange, onClose }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    document.body.classList.add('dialog-open')
    return () => {
      document.body.classList.remove('dialog-open')
      if (dialog.open) dialog.close()
    }
  }, [])

  const onCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault()
    onClose()
  }

  return (
    <dialog ref={dialogRef} className={styles.lightbox} aria-label={label} onCancel={onCancel}>
      <MediaViewer items={items} index={index} label={label} onIndexChange={onIndexChange} onClose={onClose} />
    </dialog>
  )
}
