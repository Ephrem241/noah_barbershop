import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { mediaUrl, removeMedia } from '../../lib/media'
import { initials } from '../../utils/initials'
import { useReorder, useRows, useTableMutations } from '../data'
import { errorMessage, useFeedback } from '../ui/feedback'
import { Toggle } from '../ui/fields'
import { SortButtons } from '../ui/SortButtons'
import styles from '../admin.module.css'

export function BarbersPage() {
  const barbers = useRows('barbers')
  const media = useRows('barber_media')
  const { update, remove } = useTableMutations('barbers')
  const reorder = useReorder('barbers')
  const { toast, confirm } = useFeedback()
  const navigate = useNavigate()
  const rows = barbers.data ?? []

  const del = async (id: string, name: string) => {
    const ok = await confirm({
      title: `Delete ${name}?`,
      message: 'Their profile, photos and videos will be removed from the website permanently.',
      confirmLabel: 'Delete barber',
      danger: true,
    })
    if (!ok) return
    const barber = rows.find((b) => b.id === id)
    const files = (media.data ?? []).filter((m) => m.barber_id === id).flatMap((m) => [m.path, m.poster_path])
    try {
      await remove.mutateAsync(id)
      await removeMedia(barber?.photo_path, ...files)
      toast(`${name} deleted`)
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Barbers</h1>
          <p className={styles.pageLead}>
            Profiles clients see after tapping “Book Appointment”. Hidden barbers stay here but disappear from the site.
          </p>
        </div>
        <Button icon="plus" onClick={() => navigate('/admin/barbers/new')}>
          Add barber
        </Button>
      </div>

      {barbers.isPending ? (
        <div className={`skeleton ${styles.loadingBlock}`} />
      ) : rows.length === 0 ? (
        <p className={styles.empty}>No barbers yet.</p>
      ) : (
        <ul className={styles.list}>
          {rows.map((b, i) => {
            const photo = mediaUrl(b.photo_path)
            const count = (media.data ?? []).filter((m) => m.barber_id === b.id).length
            return (
              <li key={b.id} className={`${styles.row} ${b.is_active ? '' : styles.rowHidden}`}>
                {photo ? (
                  <img className={`${styles.thumb} ${styles.thumbRound}`} src={photo} alt="" />
                ) : (
                  <span className={`${styles.thumb} ${styles.thumbRound} ${styles.pill}`} style={{ justifyContent: 'center', fontSize: '1rem' }} aria-hidden="true">
                    {initials(b.name)}
                  </span>
                )}
                <div className={styles.rowMain}>
                  <p className={styles.rowTitle}>{b.name}</p>
                  <p className={styles.rowMeta}>
                    <span>{b.role || 'No role yet'}</span>
                    <span>{b.phone}</span>
                    <span>
                      {count} {count === 1 ? 'work item' : 'work items'}
                    </span>
                    {b.is_sample ? <span className={`${styles.pill} ${styles.pillGold}`}>Sample profile</span> : null}
                    {!b.is_active ? <span className={styles.pill}>Hidden</span> : null}
                  </p>
                </div>
                <div className={styles.rowActions}>
                  <Toggle
                    label="Visible"
                    checked={b.is_active}
                    onChange={(is_active) =>
                      update.mutate(
                        { id: b.id, values: { is_active } },
                        { onError: (e) => toast(errorMessage(e), 'error') },
                      )
                    }
                  />
                  <SortButtons
                    label={b.name}
                    index={i}
                    count={rows.length}
                    disabled={reorder.isPending}
                    onMove={(direction) => reorder.mutate({ rows, index: i, direction }, { onError: (e) => toast(errorMessage(e), 'error') })}
                  />
                  <Link to={`/admin/barbers/${b.id}`} className={styles.pill}>
                    Edit
                  </Link>
                  <button type="button" className={styles.pill} onClick={() => void del(b.id, b.name)}>
                    Delete
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
