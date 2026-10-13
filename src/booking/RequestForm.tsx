import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent, type Ref } from 'react'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import type { ShopInfo } from '../content/api'
import type { Barber } from '../data/barbers'
import type { Service } from '../data/services'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { RequestPrefill } from './context'
import styles from './RequestForm.module.css'

type RequestFormProps = {
  /** 'dialog': inside the booking dialog, with its own heading. 'inline': in the page's booking section. */
  variant?: 'dialog' | 'inline'
  barbers: Barber[]
  services: Service[]
  shop: ShopInfo
  prefill?: Partial<RequestPrefill> | null
  headingRef?: Ref<HTMLHeadingElement>
  onClose?: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Today's date and time in Addis Ababa — the same clock the database uses to validate dates. */
function addisNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Addis_Ababa',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '00'
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` }
}

const addDays = (isoDate: string, days: number) =>
  new Date(Date.parse(`${isoDate}T12:00:00Z`) + days * 864e5).toISOString().slice(0, 10)

// Preferred-time choices: every 30 minutes from 8:00 to 20:30 (the shop is open 8 AM – 9 PM). These are
// preferences only — the shop confirms the actual time by phone.
const SLOTS = Array.from({ length: 26 }, (_, i) => {
  const minutes = 8 * 60 + i * 30
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const label = `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`
  return { value: `${pad(h)}:${pad(m)}`, label }
})

const PHONE_RE = /^[+0-9 ()-]{7,25}$/

type Form = {
  name: string
  phone: string
  serviceId: string
  barberId: string
  date: string
  time: string
  note: string
  website: string // honeypot: real people never see or fill this
}
type FieldName = 'name' | 'phone' | 'date' | 'time'
type Errors = Partial<Record<FieldName, string>>
const FIELD_ORDER: FieldName[] = ['name', 'phone', 'date', 'time']

function validate(form: Form, today: string, now: string): Errors {
  const errors: Errors = {}
  const phone = form.phone.trim()
  if (form.name.trim().length < 2) errors.name = 'Please enter your name.'
  if (!phone) errors.phone = 'Please enter a phone number so we can confirm your time.'
  else if (!PHONE_RE.test(phone) || phone.replace(/\D/g, '').length < 9) {
    errors.phone = 'Please check the number, e.g. 0912 345 678 or +251 91 234 5678.'
  }
  if (form.date && (form.date < today || form.date > addDays(today, 90))) {
    errors.date = 'Please choose a date between today and the next 90 days.'
  }
  if (form.time && form.date === today && form.time <= now) errors.time = 'That time has passed. Please choose a later one.'
  return errors
}

function friendlyError(message: string) {
  if (/too many requests/i.test(message)) return 'You’ve already sent several requests. Please call the shop instead.'
  if (/date/i.test(message)) return 'Please choose a date between today and the next 90 days.'
  if (/phone/i.test(message)) return 'Please check the phone number.'
  return 'Sorry, your request could not be sent. Please try again, or call the shop.'
}

const emptyForm = (prefill?: Partial<RequestPrefill> | null): Form => ({
  name: '',
  phone: '',
  serviceId: prefill?.serviceId ?? '',
  barberId: prefill?.barberId ?? '',
  date: '',
  time: '',
  note: '',
  website: '',
})

export function RequestForm({ variant = 'dialog', barbers, services, shop, prefill, headingRef, onClose }: RequestFormProps) {
  const uid = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)
  const [form, setForm] = useState<Form>(() => emptyForm(prefill))
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  // A new hand-off from the page (e.g. "Book" on a service) updates the choices but keeps what was typed
  const [appliedPrefill, setAppliedPrefill] = useState(prefill?.version)
  if (prefill?.version !== appliedPrefill) {
    setAppliedPrefill(prefill?.version)
    setForm((f) => ({ ...f, serviceId: prefill?.serviceId ?? f.serviceId, barberId: prefill?.barberId ?? f.barberId }))
    setStatus((s) => (s === 'sent' ? 'idle' : s))
  }

  // Move focus to the confirmation so screen readers announce it and keyboard users keep their place
  useEffect(() => {
    if (status === 'sent') doneRef.current?.focus()
  }, [status])

  const { date: today, time: now } = addisNow()
  const slots = form.date === today ? SLOTS.filter((s) => s.value > now) : SLOTS
  const barber = barbers.find((b) => b.id === form.barberId)
  const service = services.find((s) => s.id && s.id === form.serviceId)
  const titleId = variant === 'dialog' ? 'request-title' : `${uid}-title`
  const firstName = form.name.trim().split(/\s+/)[0]

  const set = (field: keyof Form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value
    setForm((f) => {
      const next = { ...f, [field]: value }
      // Picking today can make the chosen time a past one: clear it rather than keep a hidden value
      if (field === 'date' && value === today && next.time && next.time <= now) next.time = ''
      return next
    })
    if (field in errors) setErrors((errs) => ({ ...errs, [field]: undefined }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    const found = validate(form, today, now)
    setErrors(found)
    const first = FIELD_ORDER.find((f) => found[f])
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    if (form.website) return setStatus('sent') // bot: pretend it worked

    setStatus('sending')
    const { error } = await supabase!.from('booking_requests').insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      service_id: form.serviceId || null,
      barber_id: barber?.uuid ?? null,
      preferred_date: form.date || null,
      preferred_time: form.time || null,
      note: form.note.trim() || null,
    })
    if (error) {
      setStatus('idle')
      setSubmitError(friendlyError(error.message))
      return
    }
    setStatus('sent')
  }

  const startOver = () => {
    setForm((f) => ({ ...emptyForm(), name: f.name, phone: f.phone }))
    setStatus('idle')
  }

  const fieldProps = (name: FieldName, hint?: boolean) => ({
    name,
    id: `${uid}-${name}`,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby':
      [hint ? `${uid}-${name}-hint` : '', errors[name] ? `${uid}-${name}-error` : ''].filter(Boolean).join(' ') || undefined,
  })
  const fieldError = (name: FieldName) =>
    errors[name] ? (
      <span id={`${uid}-${name}-error`} className={styles.fieldError}>
        <Icon name="alert" size={14} strokeWidth={1.8} />
        {errors[name]}
      </span>
    ) : null

  const Heading = variant === 'dialog' ? 'h2' : 'h3'

  if (status === 'sent') {
    const slot = SLOTS.find((s) => s.value === form.time)?.label
    const when = form.date
      ? ` for ${new Date(`${form.date}T12:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}${slot ? ` at ${slot}` : ''}`
      : slot
        ? ` for ${slot}`
        : ''
    return (
      <div className={`${styles.done} ${styles[variant]}`} role="status">
        <span className={styles.doneIcon} aria-hidden="true">
          <Icon name="check" size={24} strokeWidth={1.8} />
        </span>
        <Heading id={titleId} ref={doneRef} tabIndex={-1} className={styles.title}>
          Request received{firstName ? `, ${firstName}` : ''}
        </Heading>
        <p className={styles.lead}>
          <strong>This is not a confirmed booking yet.</strong> We’ll call you on{' '}
          <span className={styles.nowrap}>{form.phone.trim()}</span> to confirm your{service ? ` ${service.title}` : ''}{' '}
          appointment
          {barber ? ` with ${barber.name}` : ''}
          {when}.
        </p>
        <p className={styles.small}>
          Need it sooner? Call us on{' '}
          <a href={shop.phone.href} className={styles.link}>
            {shop.phone.display}
          </a>
          .
        </p>
        <div className={styles.actions}>
          {variant === 'dialog' && onClose ? <Button onClick={onClose}>Done</Button> : null}
          {variant === 'inline' ? (
            <Button variant="secondary" onClick={startOver}>
              Send another request
            </Button>
          ) : null}
          <Button href={shop.phone.href} variant={variant === 'dialog' ? 'secondary' : 'primary'} icon="phone">
            Call the shop
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.wrap} ${styles[variant]}`}>
      {variant === 'dialog' ? (
        <header className={styles.intro}>
          <p className="eyebrow">Book an Appointment</p>
          <h2 id={titleId} ref={headingRef} tabIndex={-1} className={styles.title}>
            Request a Time{barber ? ` with ${barber.name}` : ''}
          </h2>
          <p className={styles.lead}>
            Tell us when suits you and we’ll call to confirm. Prefer to talk now?{' '}
            <a href={shop.phone.href} className={styles.link}>
              {shop.phone.display}
            </a>
          </p>
        </header>
      ) : null}

      {!isSupabaseConfigured ? (
        <p className={styles.error} role="alert">
          Online requests aren’t available right now. Please call{' '}
          <a href={shop.phone.href} className={styles.link}>
            {shop.phone.display}
          </a>{' '}
          to book.
        </p>
      ) : (
        <form
          ref={formRef}
          className={styles.form}
          onSubmit={submit}
          noValidate
          aria-labelledby={variant === 'dialog' ? titleId : undefined}
          aria-label={variant === 'inline' ? 'Appointment request' : undefined}
        >
          <div className={styles.field}>
            <label htmlFor={`${uid}-name`}>
              Your name <span className={styles.req}>(required)</span>
            </label>
            <input
              {...fieldProps('name')}
              value={form.name}
              onChange={set('name')}
              autoComplete="name"
              enterKeyHint="next"
              maxLength={80}
              required
            />
            {fieldError('name')}
          </div>
          <div className={styles.field}>
            <label htmlFor={`${uid}-phone`}>
              Phone number <span className={styles.req}>(required)</span>
            </label>
            <input
              {...fieldProps('phone', true)}
              value={form.phone}
              onChange={set('phone')}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="next"
              placeholder="09… or +251 9…"
              maxLength={25}
              required
            />
            <span id={`${uid}-phone-hint`} className={styles.hint}>
              We’ll call this number to confirm.
            </span>
            {fieldError('phone')}
          </div>
          <div className={styles.field}>
            <label htmlFor={`${uid}-service`}>Service</label>
            <select id={`${uid}-service`} name="service" value={form.serviceId} onChange={set('serviceId')}>
              <option value="">Not sure yet</option>
              {services
                .filter((s) => s.id)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {`${s.title} — ${s.priceFrom ? 'from ' : ''}${s.price}${s.duration ? ` · ${s.duration}` : ''}`}
                  </option>
                ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor={`${uid}-barber`}>Barber</label>
            <select id={`${uid}-barber`} name="barber" value={form.barberId} onChange={set('barberId')}>
              <option value="">Any barber</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor={`${uid}-date`}>Preferred date</label>
            <input
              {...fieldProps('date')}
              type="date"
              value={form.date}
              onChange={set('date')}
              min={today}
              max={addDays(today, 90)}
            />
            {fieldError('date')}
          </div>
          <div className={styles.field}>
            <label htmlFor={`${uid}-time`}>Preferred time</label>
            <select {...fieldProps('time')} value={form.time} onChange={set('time')}>
              <option value="">Any time</option>
              {slots.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {fieldError('time')}
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor={`${uid}-note`}>Note (optional)</label>
            <textarea
              id={`${uid}-note`}
              name="note"
              value={form.note}
              onChange={set('note')}
              rows={3}
              maxLength={500}
              placeholder="The cut you have in mind, questions…"
            />
          </div>
          <label className={styles.honeypot} aria-hidden="true">
            Website
            <input name="website" value={form.website} onChange={set('website')} tabIndex={-1} autoComplete="off" />
          </label>

          {submitError ? (
            <p className={`${styles.error} ${styles.full}`} role="alert">
              {submitError}{' '}
              <a href={shop.phone.href} className={styles.link}>
                Call {shop.phone.display}
              </a>
            </p>
          ) : null}

          <div className={`${styles.actions} ${styles.full}`}>
            <Button type="submit" disabled={status === 'sending'} icon="calendar" className={styles.submit}>
              {status === 'sending' ? 'Sending…' : 'Send request'}
            </Button>
            <p className={styles.small}>A request, not a confirmed booking: we call you to confirm the time.</p>
          </div>
        </form>
      )}
    </div>
  )
}
