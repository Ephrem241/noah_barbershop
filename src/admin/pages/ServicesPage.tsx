import { useState } from 'react'
import { Button } from '../../components/Button'
import { formatPrice } from '../../content/api'
import type { Tables } from '../../lib/database.types'
import { mediaUrl, removeMedia } from '../../lib/media'
import { nextSortOrder, useReorder, useRows, useTableMutations } from '../data'
import { errorMessage, useFeedback } from '../ui/feedback'
import { FormDialog } from '../ui/FormDialog'
import { TextArea, TextField, Toggle } from '../ui/fields'
import { ImageInput } from '../ui/ImageInput'
import { SortButtons } from '../ui/SortButtons'
import styles from '../admin.module.css'

type Service = Tables<'services'>
type Draft = { id?: string; title: string; description: string; price: string; price_is_from: boolean; image_path: string | null; is_active: boolean }

const toDraft = (s?: Service): Draft => ({
  id: s?.id,
  title: s?.title ?? '',
  description: s?.description ?? '',
  price: s ? String(s.price_etb) : '',
  price_is_from: s?.price_is_from ?? true,
  image_path: s?.image_path ?? null,
  is_active: s?.is_active ?? true,
})

export function ServicesPage() {
  const services = useRows('services')
  const { insert, update, remove } = useTableMutations('services')
  const reorder = useReorder('services')
  const { toast, confirm } = useFeedback()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const rows = services.data ?? []
  const original = draft?.id ? rows.find((s) => s.id === draft.id) : undefined

  const open = (s?: Service) => {
    setErrors({})
    setDraft(toDraft(s))
  }

  const close = async () => {
    // Discard an image uploaded in this dialog but never saved
    if (draft?.image_path && draft.image_path !== (original?.image_path ?? null)) await removeMedia(draft.image_path)
    setDraft(null)
  }

  const save = async () => {
    if (!draft) return
    const price = Number(draft.price)
    const e: Record<string, string> = {}
    if (!draft.title.trim()) e.title = 'Title is required.'
    if (!draft.price.trim() || !Number.isInteger(price) || price < 0) e.price = 'Enter the price in birr, e.g. 350.'
    setErrors(e)
    if (Object.keys(e).length) return

    const values = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      price_etb: price,
      price_is_from: draft.price_is_from,
      image_path: draft.image_path,
      is_active: draft.is_active,
    }
    try {
      if (draft.id) {
        await update.mutateAsync({ id: draft.id, values })
        if (original?.image_path && original.image_path !== draft.image_path) await removeMedia(original.image_path)
      } else {
        await insert.mutateAsync({ ...values, sort_order: nextSortOrder(rows) })
      }
      toast(draft.id ? 'Service updated' : 'Service added')
      setDraft(null)
    } catch (err) {
      toast(errorMessage(err), 'error')
    }
  }

  const del = async (s: Service) => {
    const ok = await confirm({ title: `Delete “${s.title}”?`, message: 'It will disappear from the website.', confirmLabel: 'Delete', danger: true })
    if (!ok) return
    try {
      await remove.mutateAsync(s.id)
      await removeMedia(s.image_path)
      toast('Service deleted')
    } catch (err) {
      toast(errorMessage(err), 'error')
    }
  }

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Services & prices</h1>
          <p className={styles.pageLead}>Shown in “More Than Just a Haircut” and in the booking request form.</p>
        </div>
        <Button icon="plus" onClick={() => open()}>
          Add service
        </Button>
      </div>

      {services.isPending ? (
        <div className={`skeleton ${styles.loadingBlock}`} />
      ) : rows.length === 0 ? (
        <p className={styles.empty}>No services yet.</p>
      ) : (
        <ul className={styles.list}>
          {rows.map((s, i) => (
            <li key={s.id} className={`${styles.row} ${s.is_active ? '' : styles.rowHidden}`}>
              <img className={styles.thumb} src={mediaUrl(s.image_path) ?? ''} alt="" />
              <div className={styles.rowMain}>
                <p className={styles.rowTitle}>{s.title}</p>
                <p className={styles.rowMeta}>
                  <span className={styles.price}>{formatPrice(s.price_etb, s.price_is_from)}</span>
                  <span>{s.description}</span>
                  {!s.is_active ? <span className={styles.pill}>Hidden</span> : null}
                </p>
              </div>
              <div className={styles.rowActions}>
                <Toggle
                  label="Visible"
                  checked={s.is_active}
                  onChange={(is_active) => update.mutate({ id: s.id, values: { is_active } }, { onError: (e) => toast(errorMessage(e), 'error') })}
                />
                <SortButtons
                  label={s.title}
                  index={i}
                  count={rows.length}
                  disabled={reorder.isPending}
                  onMove={(direction) => reorder.mutate({ rows, index: i, direction })}
                />
                <button type="button" className={styles.pill} onClick={() => open(s)}>
                  Edit
                </button>
                <button type="button" className={styles.pill} onClick={() => void del(s)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <FormDialog
        open={!!draft}
        title={draft?.id ? 'Edit service' : 'Add a service'}
        saving={insert.isPending || update.isPending}
        onSubmit={() => void save()}
        onClose={() => void close()}
      >
        {draft ? (
          <>
            <TextField label="Title *" value={draft.title} error={errors.title} maxLength={80} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <TextArea
              label="Description"
              value={draft.description}
              rows={3}
              maxLength={200}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
            <div className={styles.formGrid}>
              <TextField
                label="Price (ETB) *"
                value={draft.price}
                error={errors.price}
                inputMode="numeric"
                placeholder="350"
                onChange={(e) => setDraft({ ...draft, price: e.target.value.replace(/[^\d]/g, '') })}
              />
              <div style={{ alignSelf: 'end', paddingBottom: 10 }}>
                <Toggle
                  label="“From” price"
                  hint={`Shows as ${formatPrice(Number(draft.price) || 0, true)}`}
                  checked={draft.price_is_from}
                  onChange={(v) => setDraft({ ...draft, price_is_from: v })}
                />
              </div>
            </div>
            <ImageInput label="Image" value={draft.image_path} folder="services" aspect="256 / 116" onChange={(p) => setDraft({ ...draft, image_path: p })} />
            <Toggle label="Visible on the website" checked={draft.is_active} onChange={(v) => setDraft({ ...draft, is_active: v })} />
          </>
        ) : null}
      </FormDialog>
    </>
  )
}
