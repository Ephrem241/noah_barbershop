const pad = (n: number) => String(n).padStart(2, '0')

/** "14:30" → "2:30 PM" */
export function formatTime(value: string | null) {
  if (!value) return null
  const [h, m] = value.split(':').map(Number)
  return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`
}

/** "2026-10-14" → "Wed 14 Oct" */
export function formatDate(value: string | null) {
  if (!value) return null
  return new Date(`${value}T12:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/** ISO timestamp → "5 minutes ago", "yesterday", … */
export function timeAgo(iso: string) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}

export { slugify } from '../utils/slug'
