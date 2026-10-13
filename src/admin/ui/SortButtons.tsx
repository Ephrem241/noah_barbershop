import styles from './ui.module.css'

type SortButtonsProps = {
  label: string
  index: number
  count: number
  disabled?: boolean
  onMove: (direction: -1 | 1) => void
}

/** Accessible ↑/↓ reordering (no drag-and-drop needed). */
export function SortButtons({ label, index, count, disabled, onMove }: SortButtonsProps) {
  return (
    <span className={styles.sort}>
      <button type="button" aria-label={`Move ${label} up`} disabled={disabled || index === 0} onClick={() => onMove(-1)}>
        ↑
      </button>
      <button type="button" aria-label={`Move ${label} down`} disabled={disabled || index === count - 1} onClick={() => onMove(1)}>
        ↓
      </button>
    </span>
  )
}
