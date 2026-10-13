import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import type { Tables } from '../../lib/database.types'
import { MAX_UPLOAD_MB, mediaUrl, removeMedia, uploadImage, uploadVideo } from '../../lib/media'
import { nextSortOrder, useReorder, useRows, useTableMutations } from '../data'
import { slugify } from '../format'
import { errorMessage, useFeedback } from '../ui/feedback'
import { TagInput, TextArea, TextField, Toggle } from '../ui/fields'
import { ImageInput } from '../ui/ImageInput'
import { SortButtons } from '../ui/SortButtons'
import styles from '../admin.module.css'
import ui from '../ui/ui.module.css'

type Barber = Tables<'barbers'>
const PHONE_RE = /^[+0-9 ()-]{7,25}$/
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

function friendlyDbError(message: string) {
  if (/barbers_slug_key|duplicate key/i.test(message)) return 'That link name is already used by another barber.'
  if (/slug/i.test(message)) return 'The link name may only contain lowercase letters, numbers and dashes.'
  return message
}

function BarberForm({ initial, isNew }: { initial: Barber; isNew: boolean }) {
  const navigate = useNavigate()
  const { insert, update } = useTableMutations('barbers')
  const barbers = useRows('barbers')
  const { toast } = useFeedback()
  const [form, setForm] = useState(initial)
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const saving = insert.isPending || update.isPending
  const set = <K extends keyof Barber>(key: K, value: Barber[K]) => setForm((f) => ({ ...f, [key]: value }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!SLUG_RE.test(form.slug)) e.slug = 'Use lowercase letters, numbers and dashes, e.g. “ephrem”.'
    else if (form.slug === 'request') e.slug = '“request” is reserved — choose another link name.'
    if (!PHONE_RE.test(form.phone.trim())) e.phone = 'Enter a phone number like +251 94 668 8207.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    const values = {
      name: form.name.trim(),
      slug: form.slug,
      role: form.role.trim(),
      bio: form.bio.trim(),
      specialties: form.specialties,
      languages: form.languages,
      experience: form.experience.trim(),
      phone: form.phone.trim(),
      telegram: form.telegram.trim().replace(/^@/, ''),
      whatsapp: form.whatsapp.trim(),
      photo_path: form.photo_path,
      is_active: form.is_active,
      is_sample: form.is_sample,
    }
    try {
      if (isNew) {
        await insert.mutateAsync({ ...values, id: form.id, sort_order: nextSortOrder(barbers.data ?? []) })
        toast(`${values.name} added — now upload their work`)
        navigate(`/admin/barbers/${form.id}`, { replace: true })
      } else {
        await update.mutateAsync({ id: form.id, values })
        if (initial.photo_path && initial.photo_path !== form.photo_path) await removeMedia(initial.photo_path)
        toast('Profile saved')
      }
    } catch (e) {
      toast(friendlyDbError(errorMessage(e)), 'error')
    }
  }

  return (
    <form className={styles.card} onSubmit={save} noValidate>
      <h2 className={styles.cardTitle}>Profile</h2>
      <div className={styles.formGrid}>
        <div className={styles.full}>
          <ImageInput
            label="Portrait"
            value={form.photo_path}
            folder={`barbers/${form.id}`}
            maxSize={1000}
            aspect="4 / 5"
            allowRemove
            onChange={(path) => set('photo_path', path)}
          />
        </div>
        <TextField
          label="Name *"
          value={form.name}
          error={errors.name}
          maxLength={60}
          onChange={(e) => {
            const name = e.target.value
            setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }))
          }}
        />
        <TextField
          label="Link name"
          value={form.slug}
          error={errors.slug}
          hint={`Profile link: yoursite.com/#book/${form.slug || '…'}`}
          onChange={(e) => {
            setSlugTouched(true)
            set('slug', e.target.value.toLowerCase())
          }}
        />
        <TextField label="Role" value={form.role} placeholder="Master Barber" onChange={(e) => set('role', e.target.value)} />
        <TextField label="Experience" value={form.experience} placeholder="8 years" onChange={(e) => set('experience', e.target.value)} />
        <TextArea className={styles.full} label="Bio" value={form.bio} rows={4} maxLength={800} onChange={(e) => set('bio', e.target.value)} />
        <TagInput
          label="Specialties"
          value={form.specialties}
          placeholder="Type and press Enter"
          hint="The first two show on the barber card."
          onChange={(v) => set('specialties', v)}
        />
        <TagInput label="Languages" value={form.languages} placeholder="Amharic, English…" onChange={(v) => set('languages', v)} />
        <TextField
          label="Phone *"
          value={form.phone}
          error={errors.phone}
          type="tel"
          placeholder="+251 9…"
          onChange={(e) => set('phone', e.target.value)}
        />
        <TextField
          label="Telegram"
          value={form.telegram}
          placeholder="username or +2519…"
          hint="Leave empty to hide the Telegram button. A username works best; a phone number only works if they allow it in Telegram privacy settings."
          onChange={(e) => set('telegram', e.target.value)}
        />
        <TextField
          label="WhatsApp"
          value={form.whatsapp}
          placeholder="+2519…"
          hint="Only if this number uses WhatsApp. Leave empty to hide the WhatsApp button."
          onChange={(e) => set('whatsapp', e.target.value)}
        />
        <div className={styles.stack}>
          <Toggle label="Visible on the website" checked={form.is_active} onChange={(v) => set('is_active', v)} />
          <Toggle
            label="Show “Sample profile” tag"
            hint="Turn off once the real details are in."
            checked={form.is_sample}
            onChange={(v) => set('is_sample', v)}
          />
        </div>
      </div>
      <div className={styles.actions} style={{ marginTop: 22 }}>
        <Button type="submit" disabled={saving} icon="check">
          {saving ? 'Saving…' : isNew ? 'Create barber' : 'Save profile'}
        </Button>
        <Link to="/admin/barbers" className={ui.linkButton}>
          Back to barbers
        </Link>
      </div>
    </form>
  )
}

function MediaManager({ barberId }: { barberId: string }) {
  const media = useRows('barber_media')
  const { insert, update, remove } = useTableMutations('barber_media')
  const reorder = useReorder('barber_media')
  const { toast, confirm } = useFeedback()
  const [progress, setProgress] = useState<string | null>(null)
  const photosRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const items = (media.data ?? []).filter((m) => m.barber_id === barberId).sort((a, b) => a.sort_order - b.sort_order)

  const uploadPhotos = async (files: FileList | null) => {
    if (!files?.length) return
    let order = nextSortOrder(items)
    for (const [i, file] of [...files].entries()) {
      setProgress(`Uploading photo ${i + 1} of ${files.length}…`)
      try {
        const path = await uploadImage(file, `barbers/${barberId}`)
        await insert.mutateAsync({ barber_id: barberId, kind: 'photo', path, alt: '', sort_order: order++ })
      } catch (e) {
        toast(errorMessage(e), 'error')
      }
    }
    setProgress(null)
    if (photosRef.current) photosRef.current.value = ''
  }

  const uploadClip = async (file: File | undefined) => {
    if (!file) return
    setProgress('Uploading video… (this can take a minute)')
    try {
      const { path, posterPath } = await uploadVideo(file, `barbers/${barberId}`)
      await insert.mutateAsync({ barber_id: barberId, kind: 'video', path, poster_path: posterPath, alt: '', sort_order: nextSortOrder(items) })
      toast('Video added')
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
    setProgress(null)
    if (videoRef.current) videoRef.current.value = ''
  }

  const del = async (item: Tables<'barber_media'>) => {
    const ok = await confirm({ title: `Delete this ${item.kind}?`, confirmLabel: 'Delete', danger: true })
    if (!ok) return
    try {
      await remove.mutateAsync(item.id)
      await removeMedia(item.path, item.poster_path)
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  return (
    <section className={styles.card} style={{ marginTop: 20 }}>
      <h2 className={styles.cardTitle}>Work — photos & videos</h2>
      <p className={styles.pageLead} style={{ marginTop: -6, marginBottom: 16 }}>
        Photos are resized automatically. Videos: MP4, up to {MAX_UPLOAD_MB} MB (short clips under 15 seconds work best).
        Describe each item — it’s read aloud to visitors using screen readers.
      </p>
      <div className={styles.uploadBar}>
        <button type="button" className={ui.smallButton} disabled={!!progress} onClick={() => photosRef.current?.click()}>
          <Icon name="upload" size={15} /> Upload photos
        </button>
        <button type="button" className={ui.smallButton} disabled={!!progress} onClick={() => videoRef.current?.click()}>
          <Icon name="play" size={13} /> Upload a video
        </button>
        {progress ? (
          <span className={styles.progress} role="status">
            {progress}
          </span>
        ) : null}
        <input ref={photosRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => void uploadPhotos(e.target.files)} />
        <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={(e) => void uploadClip(e.target.files?.[0])} />
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>No work uploaded yet.</p>
      ) : (
        <ul className={styles.mediaGrid}>
          {items.map((item, i) => (
            <li key={item.id} className={styles.mediaTile}>
              <div className={styles.mediaImage}>
                <img src={mediaUrl(item.kind === 'video' ? item.poster_path : item.path)} alt="" loading="lazy" />
                <span className={styles.mediaKind}>{item.kind === 'video' ? '▶ Video' : 'Photo'}</span>
              </div>
              <div className={styles.mediaBody}>
                <input
                  defaultValue={item.alt}
                  placeholder="Describe it, e.g. Skin fade with beard line-up"
                  aria-label={`Description for ${item.kind} ${i + 1}`}
                  maxLength={160}
                  onBlur={(e) => {
                    const alt = e.target.value.trim()
                    if (alt !== item.alt) update.mutate({ id: item.id, values: { alt } }, { onError: (err) => toast(errorMessage(err), 'error') })
                  }}
                />
                <div className={styles.mediaFoot}>
                  <SortButtons
                    label={`${item.kind} ${i + 1}`}
                    index={i}
                    count={items.length}
                    disabled={reorder.isPending}
                    onMove={(direction) => reorder.mutate({ rows: items, index: i, direction })}
                  />
                  <button type="button" className={ui.iconButton} aria-label={`Delete ${item.kind} ${i + 1}`} onClick={() => void del(item)}>
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function BarberEditorPage() {
  const { id = 'new' } = useParams()
  const barbers = useRows('barbers')
  const isNew = id === 'new'
  const [newId] = useState(() => crypto.randomUUID())

  const blank: Barber = {
    id: newId,
    slug: '',
    name: '',
    role: '',
    bio: '',
    specialties: [],
    experience: '',
    languages: [],
    phone: '',
    telegram: '',
    whatsapp: '',
    photo_path: null,
    is_active: true,
    is_sample: false,
    sort_order: 0,
    created_at: '',
    updated_at: '',
  }
  const existing = barbers.data?.find((b) => b.id === id)

  return (
    <>
      <Link to="/admin/barbers" className={styles.backLink}>
        <Icon name="arrowLeft" size={15} /> All barbers
      </Link>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>{isNew ? 'Add a barber' : (existing?.name ?? 'Barber')}</h1>
        {existing ? (
          <Button href={`/#book/${existing.slug}`} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm" icon="external">
            View on website
          </Button>
        ) : null}
      </div>

      {!isNew && (barbers.isPending || (!existing && barbers.isFetching)) ? (
        <div className={`skeleton ${styles.loadingBlock}`} />
      ) : !isNew && !existing ? (
        <p className={styles.empty}>This barber no longer exists.</p>
      ) : (
        <>
          <BarberForm key={existing?.id ?? newId} initial={existing ?? blank} isNew={isNew} />
          {existing ? <MediaManager barberId={existing.id} /> : null}
        </>
      )}
    </>
  )
}
