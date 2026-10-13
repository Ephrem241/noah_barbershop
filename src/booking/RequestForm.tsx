import { useId, useState, type FormEvent, type Ref } from 'react'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import type { ShopInfo } from '../content/api'
import type { Barber } from '../data/barbers'
import type { Service } from '../data/services'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import styles from './RequestForm.module.css'

type RequestFormProps = {
  barbers: Barber[]
  services: Service[]
  shop: ShopInfo
  initialBarberId: string | null
  headingRef?: Ref<HTMLHeadingElement>
  onClose: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')
const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// 30-minute slots from 8:00 to 20:30 (the shop is open 8 AM – 9 PM)
const SLOTS = Array.from({ length: 26 }, (_, i) => {
  const minutes = 8 * 60 + i * 30
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const label = `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`
  return { value: `${pad(h)}:${pad(m)}`, label }
})

const PHONE_RE = /^[+0-9 ()-]{7,25}$/

function friendlyError(message: string) {
  if (/too many requests/i.test(message)) return 'You’ve sent several requests already. Please call the shop instead.'
  if (/date/i.test(message)) return 'Please choose a date between today and the next 90 days.'
  if (/phone/i.test(message)) return 'Please check the phone number.'
  return 'Sorry, the request could not be sent. Please try again or call the shop.'
}

export function RequestForm({ barbers, services, shop, initialBarberId, headingRef, onClose }: RequestFormProps) {
  const uid = useId()
  const today = new Date()
  const maxDate = new Date(today.getTime() + 90 * 864e5)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    serviceId: '',
    barberId: initialBarberId ?? '',
    date: '',
    time: '',
    note: '',
    website: '', // honeypot: real people never see or fill this
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)
  const set = (field: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const barber = barbers.find((b) => b.id === form.barberId)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (form.name.trim().length < 2) return setError('Please enter your name.')
    if (!PHONE_RE.test(form.phone.trim())) return setError('Please enter a valid phone number, e.g. +251 91 234 5678.')
    if (form.website) return setStatus('sent') // bot: pretend it worked

    setStatus('sending')
    const { error: dbError } = await supabase!.from('booking_requests').insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      service_id: form.serviceId || null,
      barber_id: barber?.uuid ?? null,
      preferred_date: form.date || null,
      preferred_time: form.time || null,
      note: form.note.trim() || null,
    })
    if (dbError) {
      setStatus('idle')
      setError(friendlyError(dbError.message))
      return
    }
    setStatus('sent')
  }

  if (status === 'sent') {
    const slot = SLOTS.find((s) => s.value === form.time)?.label
    return (
      <div className={styles.done} role="status">
        <span className={styles.doneIcon} aria-hidden="true">
          <Icon name="calendar" size={26} />
        </span>
        <h2 id="request-title" ref={headingRef} tabIndex={-1} className={styles.title}>
          Request sent
        </h2>
        <p className={styles.lead}>
          Thank you, {form.name.trim().split(' ')[0]}. We’ll call you on <strong>{form.phone.trim()}</strong> to confirm
          {barber ? ` your appointment with ${barber.name}` : ' your appointment'}
          {form.date ? ` on ${new Date(`${form.date}T12:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}` : ''}
          {slot ? ` at ${slot}` : ''}.
        </p>
        <div className={styles.actions}>
          <Button onClick={onClose}>Done</Button>
          <Button href={shop.phone.href} variant="secondary" icon="phone">
            Call the shop
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.intro}>
        <p className="eyebrow">Book an Appointment</p>
        <h2 id="request-title" ref={headingRef} tabIndex={-1} className={styles.title}>
          Request a Time{barber ? ` with ${barber.name}` : ''}
        </h2>
        <p className={styles.lead}>
          Tell us when suits you and we’ll call to confirm. Prefer to talk now?{' '}
          <a href={shop.phone.href} className={styles.link}>
            {shop.phone.display}
          </a>
        </p>
      </header>

      {!isSupabaseConfigured ? (
        <p className={styles.error} role="alert">
          Online requests aren’t available right now — please call {shop.phone.display}.
        </p>
      ) : (
        <form className={styles.form} onSubmit={submit} noValidate>
          <label className={styles.field}>
            <span>Your name *</span>
            <input value={form.name} onChange={set('name')} autoComplete="name" maxLength={80} required />
          </label>
          <label className={styles.field}>
            <span>Phone number *</span>
            <input
              value={form.phone}
              onChange={set('phone')}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+251 9…"
              maxLength={25}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Service</span>
            <select value={form.serviceId} onChange={set('serviceId')}>
              <option value="">Not sure yet</option>
              {services
                .filter((s) => s.id)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} — {s.price}
                  </option>
                ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Barber</span>
            <select value={form.barberId} onChange={set('barberId')}>
              <option value="">Any barber</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Preferred date</span>
            <input type="date" value={form.date} onChange={set('date')} min={isoDate(today)} max={isoDate(maxDate)} />
          </label>
          <label className={styles.field}>
            <span>Preferred time</span>
            <select value={form.time} onChange={set('time')}>
              <option value="">Any time</option>
              {SLOTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className={`${styles.field} ${styles.full}`}>
            <span>Note (optional)</span>
            <textarea value={form.note} onChange={set('note')} rows={3} maxLength={500} placeholder="Style ideas, questions…" />
          </label>
          <label className={styles.honeypot} aria-hidden="true">
            Website
            <input value={form.website} onChange={set('website')} tabIndex={-1} autoComplete="off" />
          </label>

          {error ? (
            <p className={`${styles.error} ${styles.full}`} role="alert" id={`${uid}-error`}>
              {error}
            </p>
          ) : null}

          <div className={`${styles.actions} ${styles.full}`}>
            <Button type="submit" disabled={status === 'sending'} aria-describedby={error ? `${uid}-error` : undefined}>
              {status === 'sending' ? 'Sending…' : 'Send request'}
            </Button>
            <p className={styles.small}>We only use your number to confirm this booking.</p>
          </div>
        </form>
      )}
    </div>
  )
}
