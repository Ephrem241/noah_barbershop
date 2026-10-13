import { useState, type FormEvent } from 'react'
import { Button } from '../../components/Button'
import { useRows, useTableMutations } from '../data'
import { useAdminSession } from '../session'
import { errorMessage, useFeedback } from '../ui/feedback'
import { TextField } from '../ui/fields'
import styles from '../admin.module.css'

export function AdminsPage() {
  const session = useAdminSession()
  const admins = useRows('admins', 'created_at')
  const { insert, remove } = useTableMutations('admins', 'email')
  const { toast, confirm } = useFeedback()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const me = session.user.email?.toLowerCase()

  const add = async (event: FormEvent) => {
    event.preventDefault()
    const value = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return setError('Enter a valid email address.')
    if (admins.data?.some((a) => a.email === value)) return setError('That email is already an admin.')
    setError(null)
    try {
      await insert.mutateAsync({ email: value })
      setEmail('')
      toast(`${value} can now sign in to the admin`)
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  const del = async (value: string) => {
    const ok = await confirm({
      title: `Remove ${value}?`,
      message: 'They will lose access to the admin panel immediately.',
      confirmLabel: 'Remove admin',
      danger: true,
    })
    if (!ok) return
    remove.mutate(value, {
      onSuccess: () => toast(`${value} removed`),
      onError: (e) => toast(errorMessage(e), 'error'),
    })
  }

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Admins</h1>
          <p className={styles.pageLead}>
            People who can sign in here with Google. Add the exact Google (Gmail) address they’ll sign in with.
          </p>
        </div>
      </div>

      <form className={`${styles.card} ${styles.actions}`} style={{ alignItems: 'flex-end', marginBottom: 18 }} onSubmit={add} noValidate>
        <TextField
          label="Add an admin"
          type="email"
          placeholder="name@gmail.com"
          value={email}
          error={error}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.rowMain}
          style={{ minWidth: 260 }}
        />
        <Button type="submit" icon="plus" disabled={insert.isPending}>
          Add admin
        </Button>
      </form>

      {admins.isPending ? (
        <div className={`skeleton ${styles.loadingBlock}`} />
      ) : (
        <ul className={styles.list}>
          {(admins.data ?? []).map((a) => (
            <li key={a.email} className={styles.row} style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
              <div className={styles.rowMain}>
                <p className={styles.rowTitle}>{a.email}</p>
                <p className={styles.rowMeta}>
                  <span>Added {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {a.email === me ? <span className={`${styles.pill} ${styles.pillGold}`}>You</span> : null}
                </p>
              </div>
              <div className={styles.rowActions}>
                <button
                  type="button"
                  className={styles.pill}
                  disabled={a.email === me || (admins.data?.length ?? 0) <= 1}
                  title={a.email === me ? 'You can’t remove yourself' : undefined}
                  onClick={() => void del(a.email)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
