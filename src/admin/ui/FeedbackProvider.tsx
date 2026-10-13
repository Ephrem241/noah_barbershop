import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Button } from '../../components/Button'
import { FeedbackContext, type ConfirmOptions } from './feedback'
import styles from './ui.module.css'

type Toast = { id: number; message: string; tone: 'success' | 'error' }

/** Toast notifications + a promise-based confirm dialog (native <dialog>, never window.confirm). */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const nextId = useRef(1)

  const toast = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = nextId.current++
    setToasts((list) => [...list, { id, message, tone }])
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), tone === 'error' ? 7000 : 3500)
  }, [])

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  )

  useEffect(() => {
    if (pending && !dialogRef.current?.open) dialogRef.current?.showModal()
  }, [pending])

  const settle = (ok: boolean) => {
    pending?.resolve(ok)
    setPending(null)
    dialogRef.current?.close()
  }

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm])

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className={styles.toasts} aria-live="polite">
        {toasts.map((t) => (
          <p key={t.id} className={`${styles.toast} ${t.tone === 'error' ? styles.toastError : ''}`} role={t.tone === 'error' ? 'alert' : undefined}>
            {t.message}
          </p>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className={styles.confirm}
        aria-labelledby="confirm-title"
        onCancel={(e) => {
          e.preventDefault()
          settle(false)
        }}
      >
        {pending ? (
          <>
            <h2 id="confirm-title" className={styles.confirmTitle}>
              {pending.title}
            </h2>
            {pending.message ? <p className={styles.confirmText}>{pending.message}</p> : null}
            <div className={styles.confirmActions}>
              <Button variant="secondary" onClick={() => settle(false)}>
                Cancel
              </Button>
              <Button className={pending.danger ? styles.danger : undefined} onClick={() => settle(true)} autoFocus>
                {pending.confirmLabel ?? 'Confirm'}
              </Button>
            </div>
          </>
        ) : null}
      </dialog>
    </FeedbackContext.Provider>
  )
}
