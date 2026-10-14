import { useState } from 'react'
import { Button } from '../../components/Button'
import { telHref, whatsappHref } from '../../booking/contact'
import type { Tables } from '../../lib/database.types'
import { useRows, useTableMutations } from '../data'
import { formatDate, formatTime, timeAgo } from '../format'
import { errorMessage, useFeedback } from '../ui/feedback'
import styles from '../admin.module.css'
import ui from '../ui/ui.module.css'

const STATUSES = ['new', 'confirmed', 'done', 'cancelled'] as const
type Status = (typeof STATUSES)[number]
const LABEL: Record<Status, string> = { new: 'New', confirmed: 'Confirmed', done: 'Done', cancelled: 'Cancelled' }

function RequestCard({
  request,
  serviceTitle,
  barberName,
}: {
  request: Tables<'booking_requests'>
  serviceTitle?: string
  barberName?: string
}) {
  const { update, remove } = useTableMutations('booking_requests')
  const { toast, confirm } = useFeedback()
  const [note, setNote] = useState(request.admin_note ?? '')
  const tel = telHref(request.phone) ?? `tel:${request.phone.replace(/[^\d+]/g, '')}`
  // Only for a number WhatsApp can reach (local 09… numbers get +251)
  const whatsapp = whatsappHref(request.phone, `Hi ${request.name}, this is Noah Barbershop about your booking request.`)

  const setStatus = async (status: Status) => {
    try {
      await update.mutateAsync({ id: request.id, values: { status } })
      toast(`Marked as ${LABEL[status].toLowerCase()}`)
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  const saveNote = async () => {
    try {
      await update.mutateAsync({ id: request.id, values: { admin_note: note.trim() || null } })
      toast('Note saved')
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  const del = async () => {
    const ok = await confirm({
      title: 'Delete this request?',
      message: `${request.name}’s request will be removed permanently.`,
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await remove.mutateAsync(request.id)
      toast('Request deleted')
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  const when = [formatDate(request.preferred_date), formatTime(request.preferred_time)].filter(Boolean).join(' · ')

  return (
    <li className={styles.request} data-status={request.status}>
      <div>
        <p className={styles.requestName}>{request.name}</p>
        <p className={styles.rowMeta}>
          <span>Received {timeAgo(request.created_at)}</span>
          <span className={`${styles.pill} ${request.status === 'new' ? styles.pillGold : ''}`}>{LABEL[request.status as Status] ?? request.status}</span>
        </p>
        <dl className={styles.requestDetails}>
          <dt>Phone</dt>
          <dd>
            <a href={tel}>{request.phone}</a>
          </dd>
          <dt>Service</dt>
          <dd>{serviceTitle ?? 'Not sure yet'}</dd>
          <dt>Barber</dt>
          <dd>{barberName ?? 'Any barber'}</dd>
          <dt>Preferred</dt>
          <dd>{when || 'Any time'}</dd>
          {request.note ? (
            <>
              <dt>Note</dt>
              <dd>{request.note}</dd>
            </>
          ) : null}
        </dl>
        <div className={styles.contactLinks}>
          <Button href={tel} size="sm" icon="phone">
            Call
          </Button>
          {whatsapp ? (
            <Button href={whatsapp} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm" icon="whatsapp">
              WhatsApp
            </Button>
          ) : null}
        </div>
      </div>

      <div className={styles.requestSide}>
        <label className={ui.field}>
          <span className={ui.label}>Status</span>
          <select
            className={ui.input}
            value={request.status}
            disabled={update.isPending}
            onChange={(e) => void setStatus(e.target.value as Status)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className={ui.field}>
          <span className={ui.label}>Internal note</span>
          <textarea
            className={ui.input}
            rows={3}
            maxLength={1000}
            value={note}
            placeholder="e.g. Confirmed by phone for 3 PM"
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <div className={styles.actions}>
          <button
            type="button"
            className={ui.smallButton}
            disabled={update.isPending || note === (request.admin_note ?? '')}
            onClick={() => void saveNote()}
          >
            Save note
          </button>
          <button type="button" className={ui.linkButton} onClick={() => void del()}>
            Delete
          </button>
        </div>
      </div>
    </li>
  )
}

export function RequestsPage() {
  const requests = useRows('booking_requests', 'created_at', false)
  const services = useRows('services')
  const barbers = useRows('barbers')
  const [filter, setFilter] = useState<Status | 'all'>('new')

  const all = requests.data ?? []
  const shown = filter === 'all' ? all : all.filter((r) => r.status === filter)
  const count = (s: Status) => all.filter((r) => r.status === s).length

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Booking requests</h1>
          <p className={styles.pageLead}>
            Requests clients sent through the website’s former request form. The website now sends clients straight
            to their barber (Barbers → contact buttons), so no new requests arrive here; earlier ones are kept.
          </p>
        </div>
      </div>

      <div className={styles.tabs} role="group" aria-label="Filter by status">
        {(['new', 'confirmed', 'done', 'cancelled', 'all'] as const).map((s) => (
          <button key={s} type="button" className={styles.tab} aria-pressed={filter === s} onClick={() => setFilter(s)}>
            {s === 'all' ? `All (${all.length})` : `${LABEL[s]} (${count(s)})`}
          </button>
        ))}
      </div>

      {requests.isPending ? (
        <div className={`skeleton ${styles.loadingBlock}`} />
      ) : requests.isError ? (
        <p className={styles.empty}>Could not load requests: {requests.error.message}</p>
      ) : shown.length === 0 ? (
        <p className={styles.empty}>No {filter === 'all' ? '' : LABEL[filter].toLowerCase()} requests.</p>
      ) : (
        <ul className={styles.list}>
          {shown.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              serviceTitle={services.data?.find((s) => s.id === r.service_id)?.title}
              barberName={barbers.data?.find((b) => b.id === r.barber_id)?.name}
            />
          ))}
        </ul>
      )}
    </>
  )
}
