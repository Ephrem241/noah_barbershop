import { useRef, useState } from 'react'
import { Icon } from '../../components/Icon'
import { GALLERY_CATEGORIES } from '../../data/gallery'
import type { Tables } from '../../lib/database.types'
import { MAX_UPLOAD_MB, mediaUrl, removeMedia, uploadImage, uploadVideo } from '../../lib/media'
import { nextSortOrder, useReorder, useRows, useTableMutations } from '../data'
import { errorMessage, useFeedback } from '../ui/feedback'
import { Toggle } from '../ui/fields'
import { SortButtons } from '../ui/SortButtons'
import styles from '../admin.module.css'
import ui from '../ui/ui.module.css'

type Kind = 'photo' | 'video'

export function GalleryPage() {
  const gallery = useRows('gallery_items')
  const { insert, update, remove } = useTableMutations('gallery_items')
  const reorder = useReorder('gallery_items')
  const { toast, confirm } = useFeedback()
  const [progress, setProgress] = useState<string | null>(null)
  const photosRef = useRef<HTMLInputElement>(null)
  const videosRef = useRef<HTMLInputElement>(null)
  const rows = gallery.data ?? []

  const upload = async (files: FileList | null, kind: Kind) => {
    if (!files?.length) return
    const list = [...files]
    let order = nextSortOrder(rows)
    let added = 0
    for (const [i, file] of list.entries()) {
      setProgress(`Uploading ${kind} ${i + 1} of ${list.length}…${kind === 'video' ? ' (this can take a minute)' : ''}`)
      let stored: string[] = []
      try {
        if (kind === 'video') {
          const { path, posterPath } = await uploadVideo(file, 'gallery')
          stored = [path, posterPath]
          await insert.mutateAsync({ kind, path, poster_path: posterPath, alt: '', sort_order: order++ })
        } else {
          const path = await uploadImage(file, 'gallery', 1400)
          stored = [path]
          await insert.mutateAsync({ path, alt: '', sort_order: order++ })
        }
        added++
      } catch (e) {
        void removeMedia(...stored) // don't leave files behind for a row that wasn't saved
        toast(errorMessage(e), 'error')
      }
    }
    setProgress(null)
    for (const ref of [photosRef, videosRef]) if (ref.current) ref.current.value = ''
    if (added) toast(`${added === 1 ? `1 ${kind}` : `${added} ${kind}s`} added — add a short description to each`)
  }

  const del = async (item: Tables<'gallery_items'>) => {
    const ok = await confirm({ title: `Delete this ${item.kind}?`, confirmLabel: 'Delete', danger: true })
    if (!ok) return
    try {
      await remove.mutateAsync(item.id)
      await removeMedia(item.path, item.poster_path)
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
            “Our Work” on the homepage shows every visible photo and video ({visible} visible now), in this order. Square
            or portrait photos look best; a category adds the item to that filter. Videos: MP4, up to {MAX_UPLOAD_MB} MB
            — short clips under 15 seconds work best.
          </p>
        </div>
        <div className={styles.uploadBar} style={{ marginBottom: 0 }}>
          {progress ? (
            <span className={styles.progress} role="status">
              {progress}
            </span>
          ) : null}
          <button type="button" className={ui.smallButton} disabled={!!progress} onClick={() => photosRef.current?.click()}>
            <Icon name="upload" size={15} /> Upload photos
          </button>
          <button type="button" className={ui.smallButton} disabled={!!progress} onClick={() => videosRef.current?.click()}>
            <Icon name="play" size={13} /> Upload videos
          </button>
          <input ref={photosRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => void upload(e.target.files, 'photo')} />
          <input ref={videosRef} type="file" accept="video/mp4,video/webm,video/quicktime" multiple hidden onChange={(e) => void upload(e.target.files, 'video')} />
        </div>
      </div>

      {gallery.isPending ? (
        <div className={`skeleton ${styles.loadingBlock}`} />
      ) : rows.length === 0 ? (
        <p className={styles.empty}>Nothing here yet — upload photos or videos.</p>
      ) : (
        <ul className={styles.mediaGrid}>
          {rows.map((item, i) => {
            const isVideo = item.kind === 'video'
            const name = `${item.kind} ${i + 1}`
            return (
              <li key={item.id} className={`${styles.mediaTile} ${item.is_active ? '' : styles.rowHidden}`}>
                <div className={styles.mediaImage}>
                  <img src={mediaUrl(isVideo ? item.poster_path : item.path)} alt="" loading="lazy" />
                  <span className={styles.mediaKind}>{isVideo ? `▶ Video #${i + 1}` : `#${i + 1}`}</span>
                </div>
                <div className={styles.mediaBody}>
                  <input
                    defaultValue={item.alt}
                    placeholder="Describe the style, e.g. Low fade with beard"
                    aria-label={`Description for ${name}`}
                    maxLength={160}
                    onBlur={(e) => {
                      const alt = e.target.value.trim()
                      if (alt !== item.alt) update.mutate({ id: item.id, values: { alt } }, { onError: (err) => toast(errorMessage(err), 'error') })
                    }}
                  />
                  <select
                    value={item.category ?? ''}
                    aria-label={`Category for ${name}`}
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
                      label={name}
                      index={i}
                      count={rows.length}
                      disabled={reorder.isPending}
                      onMove={(direction) => reorder.mutate({ rows, index: i, direction })}
                    />
                    <button type="button" className={ui.iconButton} aria-label={`Delete ${name}`} onClick={() => void del(item)}>
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
