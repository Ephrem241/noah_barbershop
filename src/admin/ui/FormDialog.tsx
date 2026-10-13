import { useEffect, useRef, type FormEvent, type ReactNode } from 'react'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import styles from './ui.module.css'

type FormDialogProps = {
  open: boolean
  title: string
  saving?: boolean
  submitLabel?: string
  onSubmit: () => void
  onClose: () => void
  children: ReactNode
}

/** Modal form (native <dialog>): Escape or Cancel closes, Enter submits. */
export function FormDialog({ open, title, saving, submitLabel = 'Save', onSubmit, onClose, children }: FormDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <dialog
      ref={ref}
      className={styles.formDialog}
      aria-labelledby="form-dialog-title"
      onCancel={(e) => {
        e.preventDefault()
        if (!saving) onClose()
      }}
    >
      {open ? (
        <form onSubmit={submit} noValidate>
          <div className={styles.formDialogHead}>
            <h2 id="form-dialog-title">{title}</h2>
            <button type="button" className={styles.iconButton} aria-label="Close" onClick={onClose} disabled={saving}>
              <Icon name="close" size={18} />
            </button>
          </div>
          <div className={styles.formDialogBody}>{children}</div>
          <div className={styles.formDialogFoot}>
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : submitLabel}
            </Button>
          </div>
        </form>
      ) : null}
    </dialog>
  )
}
