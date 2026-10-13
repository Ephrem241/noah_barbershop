import { useState, type FormEvent } from 'react'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { embedUrl, formatCoordinates, isInAddisAbaba, parseCoordinates, pinUrl } from '../../content/location'
import type { Tables } from '../../lib/database.types'
import { useRows, useTableMutations } from '../data'
import { errorMessage, useFeedback } from '../ui/feedback'
import { TextField } from '../ui/fields'
import styles from '../admin.module.css'

type Settings = Tables<'shop_settings'>
const TEXT_FIELDS = [
  'phone',
  'address_line1',
  'address_line2',
  'hours_time',
  'hours_days',
  'maps_url',
  'maps_place_id',
  'instagram_url',
  'facebook_url',
  'tiktok_url',
  'tripadvisor_url',
] as const
type TextKey = (typeof TEXT_FIELDS)[number]
const URL_FIELDS: TextKey[] = ['maps_url', 'instagram_url', 'facebook_url', 'tiktok_url', 'tripadvisor_url']

function SettingsForm({ initial }: { initial: Settings }) {
  const { update } = useTableMutations('shop_settings')
  const { toast } = useFeedback()
  const [text, setText] = useState(() => Object.fromEntries(TEXT_FIELDS.map((k) => [k, initial[k] ?? ''])) as Record<TextKey, string>)
  const [coords, setCoords] = useState(
    initial.latitude != null && initial.longitude != null
      ? formatCoordinates({ lat: initial.latitude, lng: initial.longitude })
      : '',
  )
  const [rating, setRating] = useState(initial.tripadvisor_rating != null ? Number(initial.tripadvisor_rating).toFixed(1) : '')
  const [reviewCount, setReviewCount] = useState(initial.tripadvisor_review_count != null ? String(initial.tripadvisor_review_count) : '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const field = (key: TextKey) => ({
    value: text[key],
    error: errors[key],
    onChange: (e: { target: { value: string } }) => setText((t) => ({ ...t, [key]: e.target.value })),
  })

  const pin = coords.trim() ? parseCoordinates(coords) : null
  const isShortLink = /goo\.gl|maps\.app/i.test(coords)

  const save = async (event: FormEvent) => {
    event.preventDefault()
    const e: Record<string, string> = {}
    if (!/^[+0-9 ()-]{7,25}$/.test(text.phone.trim())) e.phone = 'Enter a phone number like +251 94 668 8207.'
    for (const key of URL_FIELDS) {
      const value = text[key].trim()
      if (value && !/^https:\/\/\S+$/.test(value)) e[key] = 'Use a full link starting with https://'
    }
    if (coords.trim() && !pin) e.coords = 'Paste coordinates like 8.99642, 38.78452.'
    if (text.maps_place_id.trim() && !/^[A-Za-z0-9_-]{10,}$/.test(text.maps_place_id.trim()))
      e.maps_place_id = 'A place ID looks like ChIJfcHfGEGFSxYRQznllYj100Q.'
    const ratingNum = rating.trim() ? Number(rating) : null
    if (ratingNum != null && (!Number.isFinite(ratingNum) || ratingNum < 0 || ratingNum > 5)) e.rating = 'Rating must be between 0 and 5.'
    const countNum = reviewCount.trim() ? Number(reviewCount) : null
    if (countNum != null && (!Number.isInteger(countNum) || countNum < 0)) e.reviewCount = 'Enter a whole number.'
    setErrors(e)
    if (Object.keys(e).length) return

    const values = {
      ...Object.fromEntries(TEXT_FIELDS.map((k) => [k, text[k].trim()])),
      latitude: pin ? Number(pin.lat.toFixed(6)) : null,
      longitude: pin ? Number(pin.lng.toFixed(6)) : null,
      tripadvisor_rating: ratingNum != null ? Math.round(ratingNum * 10) / 10 : null,
      tripadvisor_review_count: countNum,
    }
    try {
      await update.mutateAsync({ id: initial.id, values })
      toast('Shop info saved')
    } catch (err) {
      toast(errorMessage(err), 'error')
    }
  }

  return (
    <form className={styles.stack} onSubmit={save} noValidate>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Contact & address</h2>
        <div className={styles.formGrid}>
          <TextField label="Shop phone *" type="tel" {...field('phone')} hint="Shown in Visit Us, the menu and the booking dialog." />
          <div />
          <TextField label="Address line 1" {...field('address_line1')} placeholder="Ednamoll Street, Bole" />
          <TextField label="Address line 2" {...field('address_line2')} placeholder="Addis Ababa, Ethiopia" />
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Exact location</h2>
        <p className={styles.pageLead} style={{ marginTop: -6, marginBottom: 14 }}>
          Sets the map pin on the website and where “Get Directions” navigates to.
        </p>
        <div className={styles.formGrid}>
          <div className={styles.stack} style={{ gap: 10 }}>
            <TextField
              label="Coordinates"
              value={coords}
              error={errors.coords}
              placeholder="8.99642, 38.78452"
              onChange={(e) => setCoords(e.target.value)}
              hint={
                <>
                  In Google Maps, find the shop and <strong>long-press its pin</strong> (on a computer: right-click it), then tap
                  the numbers to copy them and paste here. A full Google Maps link also works.
                </>
              }
            />
            {isShortLink && !pin ? (
              <p className={styles.pageLead} role="status">
                Short “maps.app.goo.gl” share links can’t be read here — open the link, then long-press the pin and copy
                the coordinates instead.
              </p>
            ) : null}
            {pin ? (
              <p className={styles.pageLead} role="status" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 6px' }}>
                <Icon name="check" size={14} style={{ color: 'var(--gold)' }} /> Pin at <strong>{formatCoordinates(pin)}</strong>
                {!isInAddisAbaba(pin) ? ' — this is outside Addis Ababa; double-check it.' : ''}{' '}
                <a href={pinUrl(pin, text.maps_place_id.trim() || undefined)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>
                  Check on Google Maps ↗
                </a>
              </p>
            ) : (
              <p className={styles.pageLead}>No pin set — the website shows a drawn map and searches Google Maps for the shop.</p>
            )}
            <TextField
              label="Google place ID (optional)"
              {...field('maps_place_id')}
              placeholder="ChIJ…"
              hint="Lets Google Maps show “Noah barbershop” by name in directions and open the shop’s listing."
            />
            <TextField
              label="Google Maps link (optional)"
              {...field('maps_url')}
              placeholder="https://maps.app.goo.gl/…"
              hint="The shop’s share link — used for map links only while no coordinates are set."
            />
          </div>
          <div>
            {pin ? (
              <iframe
                key={formatCoordinates(pin)}
                src={embedUrl(pin, 16)}
                title="Preview of the map pin"
                loading="lazy"
                style={{ width: '100%', height: 260, border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)' }}
              />
            ) : (
              <div className={styles.empty} style={{ height: 260, display: 'grid', placeItems: 'center' }}>
                Map preview appears here
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Opening hours</h2>
        <div className={styles.formGrid}>
          <TextField label="Hours" {...field('hours_time')} placeholder="8:00 AM – 9:00 PM" />
          <TextField label="Days" {...field('hours_days')} placeholder="Mon – Sun (Including Public Holidays)" />
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Tripadvisor badge</h2>
        <p className={styles.pageLead} style={{ marginTop: -6, marginBottom: 14 }}>
          Shown above the reviews (“★★★★★ 5.0 · 11 reviews on Tripadvisor”). Leave the link empty to hide it.
        </p>
        <div className={styles.formGrid}>
          <TextField className={styles.full} label="Tripadvisor listing link" {...field('tripadvisor_url')} placeholder="https://www.tripadvisor.com/…" />
          <TextField label="Rating" value={rating} error={errors.rating} inputMode="decimal" placeholder="5.0" onChange={(e) => setRating(e.target.value)} />
          <TextField
            label="Number of reviews"
            value={reviewCount}
            error={errors.reviewCount}
            inputMode="numeric"
            placeholder="11"
            onChange={(e) => setReviewCount(e.target.value.replace(/[^\d]/g, ''))}
          />
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Social media</h2>
        <p className={styles.pageLead} style={{ marginTop: -6, marginBottom: 14 }}>
          Icons appear in the footer only for the links you fill in.
        </p>
        <div className={styles.formGrid}>
          <TextField label="Instagram" {...field('instagram_url')} placeholder="https://instagram.com/…" />
          <TextField label="Facebook" {...field('facebook_url')} placeholder="https://facebook.com/…" />
          <TextField label="TikTok" {...field('tiktok_url')} placeholder="https://tiktok.com/@…" />
        </div>
      </section>

      <div className={styles.actions}>
        <Button type="submit" icon="check" disabled={update.isPending}>
          {update.isPending ? 'Saving…' : 'Save shop info'}
        </Button>
      </div>
    </form>
  )
}

export function SettingsPage() {
  const settings = useRows('shop_settings', 'id')
  const row = settings.data?.[0]
  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Shop info</h1>
          <p className={styles.pageLead}>Phone, address, map location, opening hours and links used across the website.</p>
        </div>
      </div>
      {settings.isPending ? (
        <div className={`skeleton ${styles.loadingBlock}`} />
      ) : row ? (
        <SettingsForm key={row.updated_at} initial={row} />
      ) : (
        <p className={styles.empty}>Shop settings are missing — re-run the seed migration.</p>
      )}
    </>
  )
}
