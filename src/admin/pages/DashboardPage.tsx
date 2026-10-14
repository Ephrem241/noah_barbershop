import { Link } from 'react-router-dom'
import { useRows } from '../data'
import { formatDate, formatTime, timeAgo } from '../format'
import { useAdminSession } from '../session'
import styles from '../admin.module.css'

export function DashboardPage() {
  const session = useAdminSession()
  const requests = useRows('booking_requests', 'created_at', false)
  const barbers = useRows('barbers')
  const services = useRows('services')
  const gallery = useRows('gallery_items')
  const testimonials = useRows('testimonials')

  const fresh = (requests.data ?? []).filter((r) => r.status === 'new')
  const firstName = (session.user.user_metadata?.full_name as string | undefined)?.split(' ')[0]

  const stats = [
    { label: 'New booking requests', value: fresh.length, to: '/admin/requests', highlight: fresh.length > 0 },
    { label: 'Barbers', value: barbers.data?.length, to: '/admin/barbers' },
    { label: 'Services', value: services.data?.length, to: '/admin/services' },
    { label: 'Gallery photos', value: gallery.data?.length, to: '/admin/gallery' },
    { label: 'Testimonials', value: testimonials.data?.length, to: '/admin/testimonials' },
  ]

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Welcome{firstName ? `, ${firstName}` : ''}</h1>
          <p className={styles.pageLead}>Everything you change here appears on the website right away.</p>
        </div>
      </div>

      <div className={styles.stats}>
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className={`${styles.stat} ${s.highlight ? styles.statHighlight : ''}`}>
            <span className={styles.statValue}>{s.value ?? '–'}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </Link>
        ))}
      </div>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Latest new requests</h2>
        {fresh.length === 0 ? (
          <p className={styles.empty}>
            No new booking requests. Clients now contact their barber directly from the website, so the request inbox
            only holds earlier requests.
          </p>
        ) : (
          <ul className={styles.list}>
            {fresh.slice(0, 5).map((r) => (
              <li key={r.id} className={styles.row} style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
                <div className={styles.rowMain}>
                  <p className={styles.rowTitle}>{r.name}</p>
                  <p className={styles.rowMeta}>
                    <a href={`tel:${r.phone.replace(/[^\d+]/g, '')}`}>{r.phone}</a>
                    {r.preferred_date ? <span>{[formatDate(r.preferred_date), formatTime(r.preferred_time)].filter(Boolean).join(' · ')}</span> : null}
                    <span>{timeAgo(r.created_at)}</span>
                  </p>
                </div>
                <Link to="/admin/requests" className={styles.pill}>
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
