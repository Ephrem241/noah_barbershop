import { useState } from 'react'
import { Button } from '../../components/Button'
import type { Tables } from '../../lib/database.types'
import { nextSortOrder, useReorder, useRows, useTableMutations } from '../data'
import { errorMessage, useFeedback } from '../ui/feedback'
import { FormDialog } from '../ui/FormDialog'
import { SelectField, TextArea, TextField, Toggle } from '../ui/fields'
import { SortButtons } from '../ui/SortButtons'
import styles from '../admin.module.css'

type Testimonial = Tables<'testimonials'>
type Draft = Pick<Testimonial, 'quote' | 'name' | 'source' | 'review_date' | 'rating' | 'is_published'> & { id?: string }

const blank: Draft = { quote: '', name: '', source: 'Tripadvisor', review_date: '', rating: 5, is_published: true }

export function TestimonialsPage() {
  const testimonials = useRows('testimonials')
  const { insert, update, remove } = useTableMutations('testimonials')
  const reorder = useReorder('testimonials')
  const { toast, confirm } = useFeedback()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const rows = testimonials.data ?? []

  const save = async () => {
    if (!draft) return
    const e: Record<string, string> = {}
    if (!draft.quote.trim()) e.quote = 'The review text is required.'
    if (!draft.name.trim()) e.name = 'Reviewer name is required.'
    setErrors(e)
    if (Object.keys(e).length) return
    const values = {
      quote: draft.quote.trim(),
      name: draft.name.trim(),
      source: draft.source.trim(),
      review_date: draft.review_date.trim(),
      rating: draft.rating,
      is_published: draft.is_published,
    }
    try {
      if (draft.id) await update.mutateAsync({ id: draft.id, values })
      else await insert.mutateAsync({ ...values, sort_order: nextSortOrder(rows) })
      toast(draft.id ? 'Testimonial updated' : 'Testimonial added')
      setDraft(null)
    } catch (err) {
      toast(errorMessage(err), 'error')
    }
  }

  const del = async (t: Testimonial) => {
    const ok = await confirm({ title: `Delete ${t.name}’s review?`, confirmLabel: 'Delete', danger: true })
    if (!ok) return
    remove.mutate(t.id, { onSuccess: () => toast('Testimonial deleted'), onError: (e) => toast(errorMessage(e), 'error') })
  }

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Testimonials</h1>
          <p className={styles.pageLead}>Client reviews in “What Our Clients Say”. Only publish real reviews from real clients.</p>
        </div>
        <Button
          icon="plus"
          onClick={() => {
            setErrors({})
            setDraft(blank)
          }}
        >
          Add testimonial
        </Button>
      </div>

      {testimonials.isPending ? (
        <div className={`skeleton ${styles.loadingBlock}`} />
      ) : rows.length === 0 ? (
        <p className={styles.empty}>No testimonials yet.</p>
      ) : (
        <ul className={styles.list}>
          {rows.map((t, i) => (
            <li key={t.id} className={`${styles.row} ${t.is_published ? '' : styles.rowHidden}`} style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
              <div className={styles.rowMain}>
                <p className={styles.rowTitle} style={{ whiteSpace: 'normal' }}>
                  “{t.quote.length > 140 ? `${t.quote.slice(0, 140)}…` : t.quote}”
                </p>
                <p className={styles.rowMeta}>
                  <span>{t.name}</span>
                  <span>{[t.source, t.review_date].filter(Boolean).join(' · ')}</span>
                  <span className={styles.price} aria-label={`${t.rating} stars`}>
                    {'★'.repeat(t.rating)}
                  </span>
                  {!t.is_published ? <span className={styles.pill}>Hidden</span> : null}
                </p>
              </div>
              <div className={styles.rowActions}>
                <Toggle
                  label="Published"
                  checked={t.is_published}
                  onChange={(is_published) => update.mutate({ id: t.id, values: { is_published } })}
                />
                <SortButtons
                  label={`${t.name}’s review`}
                  index={i}
                  count={rows.length}
                  disabled={reorder.isPending}
                  onMove={(direction) => reorder.mutate({ rows, index: i, direction })}
                />
                <button
                  type="button"
                  className={styles.pill}
                  onClick={() => {
                    setErrors({})
                    setDraft({ ...t })
                  }}
                >
                  Edit
                </button>
                <button type="button" className={styles.pill} onClick={() => void del(t)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <FormDialog
        open={!!draft}
        title={draft?.id ? 'Edit testimonial' : 'Add a testimonial'}
        saving={insert.isPending || update.isPending}
        onSubmit={() => void save()}
        onClose={() => setDraft(null)}
      >
        {draft ? (
          <>
            <TextArea label="Review *" value={draft.quote} error={errors.quote} rows={5} maxLength={1200} onChange={(e) => setDraft({ ...draft, quote: e.target.value })} />
            <div className={styles.formGrid}>
              <TextField label="Reviewer name *" value={draft.name} error={errors.name} maxLength={80} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              <SelectField label="Rating" value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {'★'.repeat(n)} ({n})
                  </option>
                ))}
              </SelectField>
              <TextField label="Source" value={draft.source} placeholder="Tripadvisor, Google…" onChange={(e) => setDraft({ ...draft, source: e.target.value })} />
              <TextField label="Date" value={draft.review_date} placeholder="Dec 2025" onChange={(e) => setDraft({ ...draft, review_date: e.target.value })} />
            </div>
            <Toggle label="Published on the website" checked={draft.is_published} onChange={(v) => setDraft({ ...draft, is_published: v })} />
          </>
        ) : null}
      </FormDialog>
    </>
  )
}
