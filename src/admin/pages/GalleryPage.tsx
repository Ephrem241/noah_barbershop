import { useRef, useState } from 'react'
import { Icon } from '../../components/Icon'
import { GALLERY_CATEGORIES } from '../../data/gallery'
import type { Tables } from '../../lib/database.types'
import { mediaUrl, removeMedia, uploadImage } from '../../lib/media'
import { nextSortOrder, useReorder, useRows, useTableMutations } from '../data'
import { errorMessage, useFeedback } from '../ui/feedback'
import { Toggle } from '../ui/fields'
import { SortButtons } from '../ui/SortButtons'
import styles from '../admin.module.css'
import ui from '../ui/ui.module.css'

export function GalleryPage() {
  const gallery = useRows('gallery_items')
  const { insert, update, remove } = useTableMutations('gallery_items')
  const reorder = useReorder('gallery_items')
  const { toast, confirm } = useFeedback()
  const [progress, setProgress] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const rows = gallery.data ?? []

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    let order = nextSortOrder(rows)
    for (const [i, file] of [...files].entries()) {
      setProgress(`Uploading ${i + 1} of ${files.length}…`)
      try {
        const path = await uploadImage(file, 'gallery', 1400)
        await insert.mutateAsync({ path, alt: '', sort_order: order++ })
      } catch (e) {
        toast(errorMessage(e), 'error')
      }
    }
    setProgress(null)
    if (fileRef.current) fileRef.current.value = ''
    toast('Photos added — add a short description to each')
  }

  const del = async (item: Tables<'gallery_items'>) => {
    const ok = await confirm({ title: 'Delete this photo?', confirmLabel: 'Delete', danger: true })
    if (!ok) return
    try {
      await remove.mutateAsync(item.id)
      await removeMedia(item.path)
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  const visible = rows.filter((r) => r.is_active).length

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Gallery</h1>
          <p className={styles.pageLead}>
            “Our Work” on the homepage shows every visible photo ({visible} visible now), in this order. Square or
            portrait photos look best; a category adds the photo to that filter.
          </p>
        </div>
        <div className={styles.uploadBar} style={{ marginBottom: 0 }}>
          {progress ? (
            <span className={styles.progress} role="status">
              {progress}
            </span>
          ) : null}
          <button type="button" className={ui.smallButton} disabled={!!progress} onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={15} /> Upload photos
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => void upload(e.target.files)} />
        </div>
      </div>

      {gallery.isPending ? (
        <div className={`skeleton ${styles.loadingBlock}`} />
      ) : rows.length === 0 ? (
        <p className={styles.empty}>No photos yet — upload some.</p>
      ) : (
        <ul className={styles.mediaGrid}>
          {rows.map((item, i) => (
            <li key={item.id} className={`${styles.mediaTile} ${item.is_active ? '' : styles.rowHidden}`}>
              <div className={styles.mediaImage}>
                <img src={mediaUrl(item.path)} alt="" loading="lazy" />
                <span className={styles.mediaKind}>#{i + 1}</span>
              </div>
              <div className={styles.mediaBody}>
                <input
                  defaultValue={item.alt}
                  placeholder="Describe the style, e.g. Low fade with beard"
                  aria-label={`Description for photo ${i + 1}`}
                  maxLength={160}
                  onBlur={(e) => {
                    const alt = e.target.value.trim()
                    if (alt !== item.alt) update.mutate({ id: item.id, values: { alt } }, { onError: (err) => toast(errorMessage(err), 'error') })
                  }}
                />
                <select
                  value={item.category ?? ''}
                  aria-label={`Category for photo ${i + 1}`}
                  onChange={(e) =>
                    update.mutate({ id: item.id, values: { category: e.target.value } }, { onError: (err) => toast(errorMessage(err), 'error') })
                  }
                >
                  <option value="">No category</option>
                  {GALLERY_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <Toggle
                  label="Visible"
                  checked={item.is_active}
                  onChange={(is_active) => update.mutate({ id: item.id, values: { is_active } })}
                />
                <div className={styles.mediaFoot}>
                  <SortButtons
                    label={`photo ${i + 1}`}
                    index={i}
                    count={rows.length}
                    disabled={reorder.isPending}
                    onMove={(direction) => reorder.mutate({ rows, index: i, direction })}
                  />
                  <button type="button" className={ui.iconButton} aria-label={`Delete photo ${i + 1}`} onClick={() => void del(item)}>
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
