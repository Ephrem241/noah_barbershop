import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { contactLinks, formatPhone, normalizePhone, normalizeTelegram, telegramHref, telHref, whatsappHref } from '../../booking/contact'
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
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const PHONE_ERROR = 'Enter a full number, e.g. +251 94 668 8207 or 0946688207 (other countries need their +code).'

/** Shown on the website: visible and no longer a sample */
const isPublished = (b: Pick<Barber, 'is_active' | 'is_sample'>) => b.is_active && !b.is_sample

/** Stored in one standard form: "+251 94 668 8207", and Telegram usernames without "@" or a link */
const storedPhone = (raw: string) => {
  const phone = normalizePhone(raw)
  return phone ? formatPhone(phone) : ''
}
const storedTelegram = (raw: string) => {
  const contact = normalizeTelegram(raw) ?? ''
  return contact.startsWith('+') ? formatPhone(contact) : contact
}

const linksOf = (b: Pick<Barber, 'phone' | 'whatsapp' | 'telegram'>) =>
  contactLinks({ phoneNumber: b.phone, whatsappNumber: b.whatsapp, telegramUsername: b.telegram })

/** "Call +251 94 668 8207 · Telegram @noahbarber" */
function contactSummary(b: Pick<Barber, 'phone' | 'whatsapp' | 'telegram'>) {
  const { call, whatsapp, telegram } = linksOf(b)
  return [call && `Call ${call.number}`, whatsapp && `WhatsApp ${whatsapp.number}`, telegram && `Telegram ${telegram.handle}`]
    .filter(Boolean)
    .join(' · ')
}

/** "Opens wa.me/251946688207" for a valid value, so staff can check the link before saving */
const opens = (href: string | null) => (href ? `Opens ${href.replace(/^https:\/\//, '').replace(/\?.*$/, '')}` : null)

const listJoin = (items: string[]) =>
  items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : (items[0] ?? '')

function friendlyDbError(message: string) {
  if (/barbers_slug_key|duplicate key/i.test(message)) return 'That link name is already used by another barber.'
  if (/slug/i.test(message)) return 'The link name may only contain lowercase letters, numbers and dashes.'
  return message
}

function BarberForm({ initial, isNew }: { initial: Barber; isNew: boolean }) {
  const navigate = useNavigate()
  const { insert, update } = useTableMutations('barbers')
  const barbers = useRows('barbers')
  const { toast, confirm } = useFeedback()
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
    if (form.phone.trim() && !normalizePhone(form.phone)) e.phone = PHONE_ERROR
    if (form.whatsapp.trim() && !normalizePhone(form.whatsapp)) e.whatsapp = PHONE_ERROR
    if (form.telegram.trim() && !normalizeTelegram(form.telegram)) {
      e.telegram = 'Enter the public username (5–32 letters, digits or _), e.g. noahbarber, @noahbarber or t.me/noahbarber.'
    }
    // Only finished profiles reach the website
    if (isPublished(form)) {
      const { call, whatsapp, telegram } = linksOf(form)
      const missing = [
        !form.photo_path && 'a portrait',
        !form.bio.trim() && 'a bio',
        !form.specialties.length && 'at least one specialty',
        !call && !whatsapp && !telegram && 'a phone, WhatsApp or Telegram contact',
      ].filter((m): m is string => Boolean(m))
      if (missing.length) {
        e.publish = `To show this profile on the website, add ${listJoin(missing)}, or keep “Sample profile” on until then.`
      }
    }
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
      phone: storedPhone(form.phone),
      telegram: storedTelegram(form.telegram),
      whatsapp: storedPhone(form.whatsapp),
      photo_path: form.photo_path,
      is_active: form.is_active,
      is_sample: form.is_sample,
    }

    // Contact details become public: staff confirm exactly what visitors will see
    const wasPublished = !isNew && isPublished(initial)
    const contactChanged = contactSummary(values) !== contactSummary(initial)
    if (isPublished(values) && (!wasPublished || contactChanged)) {
      const ok = await confirm({
        title: wasPublished ? `Update ${values.name}’s public contact details?` : `Publish ${values.name}’s profile?`,
        message: `Visitors will see ${values.name}’s photo and bio, and can contact them directly: ${contactSummary(values)}. Only publish details ${values.name} has agreed to share publicly.`,
        confirmLabel: wasPublished ? 'Save' : 'Publish',
      })
      if (!ok) return
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
          hint={`Profile link: yoursite.com/barbers#book/${form.slug || '…'}`}
          onChange={(e) => {
            setSlugTouched(true)
            set('slug', e.target.value.toLowerCase())
          }}
        />
        <TextField label="Role" value={form.role} placeholder="Master Barber" onChange={(e) => set('role', e.target.value)} />
        <TextField label="Experience" value={form.experience} placeholder="8 years" onChange={(e) => set('experience', e.target.value)} />
        <TextArea
          className={styles.full}
          label="Bio"
          value={form.bio}
          rows={4}
          maxLength={800}
          hint="A short introduction: the first two or three lines show on the barber card, all of it on the profile."
          onChange={(e) => set('bio', e.target.value)}
        />
        <TagInput
          label="Specialties"
          value={form.specialties}
          placeholder="Type and press Enter"
          hint="The first two show on the barber card."
          onChange={(v) => set('specialties', v)}
        />
        <TagInput label="Languages" value={form.languages} placeholder="Amharic, English…" onChange={(v) => set('languages', v)} />
        <p className={`${styles.full} ${ui.hint}`}>
          Contact buttons on the website. Only enter numbers and usernames the barber has agreed to show publicly;
          leave a field empty to hide that button.
        </p>
        <TextField
          label="Phone (Call button)"
          value={form.phone}
          error={errors.phone}
          type="tel"
          placeholder="+251 9… or 09…"
          hint={opens(telHref(form.phone)) ?? 'The barber’s own number for bookings.'}
          onChange={(e) => set('phone', e.target.value)}
        />
        <TextField
          label="WhatsApp number"
          value={form.whatsapp}
          error={errors.whatsapp}
          type="tel"
          placeholder="+251 9… or 09…"
          hint={opens(whatsappHref(form.whatsapp, '')) ?? 'Only if this number uses WhatsApp.'}
          onChange={(e) => set('whatsapp', e.target.value)}
        />
        <TextField
          label="Telegram username"
          value={form.telegram}
          error={errors.telegram}
          placeholder="noahbarber"
          hint={
            opens(telegramHref(form.telegram)) ??
            'The public @username (best), or a phone number if they allow it in Telegram’s privacy settings.'
          }
          onChange={(e) => set('telegram', e.target.value)}
        />
        <div className={styles.stack}>
          <Toggle label="Visible on the website" checked={form.is_active} onChange={(v) => set('is_active', v)} />
          <Toggle
            label="Sample profile (not shown on the website)"
            hint="Turn off once the real details are in: the profile then appears on the website."
            checked={form.is_sample}
            onChange={(v) => set('is_sample', v)}
          />
          {errors.publish ? (
            <p className={ui.fieldError} role="alert">
              {errors.publish}
            </p>
          ) : null}
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
          <Button href={`/barbers#book/${existing.slug}`} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm" icon="external">
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
