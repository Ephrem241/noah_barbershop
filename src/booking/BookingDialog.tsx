import { useEffect, useRef, useState, type MouseEvent, type SyntheticEvent } from 'react'
import { Icon } from '../components/Icon'
import { MediaViewer } from '../components/MediaViewer'
import { useBarbers } from '../content/hooks'
import { BarberProfile } from './BarberProfile'
import { useBooking } from './context'
import { useSelectedService } from './useSelectedService'
import styles from './BookingDialog.module.css'

/** A barber's profile (bio, contact buttons, work) over the page, at #book/<barberId>. */
export function BookingDialog() {
  const { barberId, closeProfile } = useBooking()
  const { data: barbers, isLoading: barbersLoading } = useBarbers()
  const { service } = useSelectedService()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [viewer, setViewer] = useState<{ barberId: string; index: number } | null>(null)

  const barber = barberId ? (barbers.find((b) => b.id === barberId) ?? null) : null
  const waitingForBarber = !!barberId && !barber && barbersLoading
  // A link to a profile that isn't published simply shows the page
  const open = !!barber || waitingForBarber
  // The viewer only belongs to the profile it was opened from
  const viewerIndex = viewer && barber && viewer.barberId === barber.id ? viewer.index : null

  // Mirror the state onto the native <dialog> (top layer, focus containment, focus return)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      document.body.classList.add('dialog-open')
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  // New view: start at the top and move focus to its heading
  const view = open ? `${barberId}:${waitingForBarber}` : null
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
    else closeProfile()
  }

  // The browser may close the dialog itself (e.g. repeated Escape); keep state and history in sync
  const onClose = () => {
    document.body.classList.remove('dialog-open')
    if (open) closeProfile()
  }

  // A click on the dialog element itself (not its panel) is a click on the backdrop
  const onBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) closeProfile()
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={barber ? 'barber-title' : undefined}
      aria-label={barber ? undefined : 'Barber profile'}
      onCancel={onCancel}
      onClose={onClose}
      onClick={onBackdropClick}
    >
      <div ref={panelRef} className={styles.panel} inert={viewerIndex !== null}>
        <div className={styles.topbar}>
          <button type="button" className={styles.close} aria-label="Close profile" onClick={closeProfile}>
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {barber ? (
            <BarberProfile
              barber={barber}
              serviceTitle={service?.title}
              headingRef={headingRef}
              onOpenMedia={(index) => setViewer({ barberId: barber.id, index })}
            />
          ) : waitingForBarber ? (
            <div className={`skeleton ${styles.loading}`} aria-label="Loading barber profile" role="status" />
          ) : null}
        </div>
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
