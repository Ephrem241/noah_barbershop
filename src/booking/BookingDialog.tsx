import { useEffect, useRef, useState, type MouseEvent, type SyntheticEvent } from 'react'
import { Icon } from '../components/Icon'
import { useBarbers, useServices, useShop } from '../content/hooks'
import { BarberCard } from './BarberCard'
import { BarberProfile } from './BarberProfile'
import { useBooking } from './context'
import { MediaViewer } from '../components/MediaViewer'
import { RequestForm } from './RequestForm'
import styles from './BookingDialog.module.css'

export function BookingDialog() {
  const { route, showBarber, showRequest, goBack, closeBooking } = useBooking()
  const { data: barbers, isLoading: barbersLoading } = useBarbers()
  const { data: services } = useServices()
  const shop = useShop()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [viewer, setViewer] = useState<{ barberId: string; index: number } | null>(null)

  const barber = route.open && route.barberId ? (barbers.find((b) => b.id === route.barberId) ?? null) : null
  const isRequest = route.open && route.request
  const waitingForBarber = route.open && !!route.barberId && !barber && barbersLoading
  // The viewer only belongs to the profile it was opened from
  const viewerIndex = viewer && barber && !isRequest && viewer.barberId === barber.id ? viewer.index : null

  // Mirror the route onto the native <dialog> (top layer, focus containment, focus return)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (route.open && !dialog.open) {
      dialog.showModal()
      document.body.classList.add('dialog-open')
    } else if (!route.open && dialog.open) {
      dialog.close()
    }
  }, [route.open])

  // New view: start at the top and move focus to its heading
  const view = route.open ? `${route.barberId ?? 'list'}:${route.request}:${waitingForBarber}` : null
  useEffect(() => {
    if (!view) return
    panelRef.current?.scrollTo({ top: 0 })
    headingRef.current?.focus({ preventScroll: true })
  }, [view])

  const closeViewer = () => {
    const index = viewer?.index
    setViewer(null)
    requestAnimationFrame(() =>
      panelRef.current?.querySelector<HTMLElement>(`[data-work-index="${index}"]`)?.focus(),
    )
  }

  // Escape: close the viewer first, then the dialog (through our history-aware close)
  const onCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault()
    if (viewerIndex !== null) closeViewer()
    else closeBooking()
  }

  // The browser may close the dialog itself (e.g. repeated Escape); keep state and history in sync
  const onClose = () => {
    document.body.classList.remove('dialog-open')
    if (route.open) closeBooking()
  }

  // A click on the dialog element itself (not its panel) is a click on the backdrop
  const onBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) closeBooking()
  }

  const labelledBy = isRequest ? 'request-title' : barber ? 'barber-title' : 'booking-title'

  let content = null
  if (route.open && isRequest) {
    content = (
      <RequestForm
        key={route.barberId ?? 'any'}
        barbers={barbers}
        services={services}
        shop={shop}
        prefill={barber ? { barberId: barber.id } : null}
        headingRef={headingRef}
        onClose={closeBooking}
      />
    )
  } else if (route.open && barber) {
    content = (
      <BarberProfile
        barber={barber}
        headingRef={headingRef}
        onOpenMedia={(index) => setViewer({ barberId: barber.id, index })}
        onRequest={() => showRequest(barber.id)}
      />
    )
  } else if (waitingForBarber) {
    content = <div className={`skeleton ${styles.loading}`} aria-label="Loading barber profile" role="status" />
  } else if (route.open) {
    content = (
      <>
        <header className={styles.intro}>
          <p className="eyebrow">Book an Appointment</p>
          <h2 id="booking-title" ref={headingRef} tabIndex={-1} className={styles.title}>
            Choose Your Barber
          </h2>
          <p className={styles.lead}>
            Pick a barber to see their work and call them directly, or send a request and we’ll call you to confirm a
            time.
          </p>
        </header>
        <ul className={styles.grid} aria-busy={barbersLoading}>
          {barbersLoading
            ? Array.from({ length: 3 }, (_, i) => (
                <li key={i} className={`skeleton ${styles.cardSkeleton}`} aria-hidden="true" />
              ))
            : barbers.map((b) => (
                <li key={b.id}>
                  <BarberCard barber={b} onSelect={showBarber} />
                </li>
              ))}
        </ul>
        <div className={styles.shop}>
          <button type="button" className={styles.requestLink} onClick={() => showRequest(null)}>
            <Icon name="calendar" size={15} strokeWidth={1.7} />
            Request a time with any barber
          </button>
          <span>
            Prefer to call?{' '}
            <a href={shop.phone.href} className={styles.shopPhone}>
              {shop.phone.display}
            </a>
          </span>
          <span className={styles.hours}>
            <Icon name="clock" size={14} strokeWidth={1.7} />
            Open daily {shop.hours.time}
          </span>
        </div>
      </>
    )
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={labelledBy}
      onCancel={onCancel}
      onClose={onClose}
      onClick={onBackdropClick}
    >
      <div ref={panelRef} className={styles.panel} inert={viewerIndex !== null}>
        <div className={styles.topbar}>
          {barber || isRequest ? (
            <button type="button" className={styles.back} onClick={goBack}>
              <Icon name="arrowLeft" size={16} strokeWidth={1.7} />
              {isRequest ? 'Back' : 'All barbers'}
            </button>
          ) : (
            <span />
          )}
          <button type="button" className={styles.close} aria-label="Close booking" onClick={closeBooking}>
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={styles.content}>{content}</div>
      </div>

      {barber && viewerIndex !== null ? (
        <MediaViewer
          items={barber.work}
          index={viewerIndex}
          label={`${barber.name}’s work`}
          onIndexChange={(index) => setViewer({ barberId: barber.id, index })}
          onClose={closeViewer}
        />
      ) : null}
    </dialog>
  )
}
