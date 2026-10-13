import { useRef, useState } from 'react'
import { mediaUrl, uploadImage } from '../../lib/media'
import { errorMessage, useFeedback } from './feedback'
import styles from './ui.module.css'

type ImageInputProps = {
  label: string
  value: string | null
  folder: string
  onChange: (path: string | null) => void
  /** Long edge of the stored image in px */
  maxSize?: number
  aspect?: string
  allowRemove?: boolean
}

/** Shows the current image; picking a file resizes it in the browser and uploads it straight away. */
export function ImageInput({ label, value, folder, onChange, maxSize, aspect = '4 / 3', allowRemove = false }: ImageInputProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const { toast } = useFeedback()
  const src = mediaUrl(value)

  const pick = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      onChange(await uploadImage(file, folder, maxSize))
    } catch (e) {
      toast(errorMessage(e), 'error')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.imageInput}>
        <div className={styles.imagePreview} style={{ aspectRatio: aspect }}>
          {src ? <img src={src} alt="" /> : <span className={styles.hint}>No image</span>}
          {busy ? <span className={styles.uploading}>Uploading…</span> : null}
        </div>
        <div className={styles.imageActions}>
          <button type="button" className={styles.smallButton} disabled={busy} onClick={() => fileRef.current?.click()}>
            {src ? 'Replace image' : 'Upload image'}
          </button>
          {allowRemove && src ? (
            <button type="button" className={styles.linkButton} disabled={busy} onClick={() => onChange(null)}>
              Remove
            </button>
          ) : null}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => void pick(e.target.files?.[0])}
          />
        </div>
      </div>
    </div>
  )
}
