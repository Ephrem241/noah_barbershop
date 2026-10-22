import { useId, useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Icon } from '../../components/Icon'
import { splitList } from '../../content/tidy'
import styles from './ui.module.css'

type FieldShellProps = { label: string; hint?: ReactNode; error?: string | null; children: (id: string, describedBy?: string) => ReactNode; className?: string }

function FieldShell({ label, hint, error, children, className }: FieldShellProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children(id, describedBy)}
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.fieldError}>
          {error}
        </p>
      ) : null}
    </div>
  )
}

type Common = { label: string; hint?: ReactNode; error?: string | null; className?: string }

export function TextField({ label, hint, error, className, ...input }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      {(id, describedBy) => (
        <input id={id} className={styles.input} aria-invalid={!!error || undefined} aria-describedby={describedBy} {...input} />
      )}
    </FieldShell>
  )
}

export function TextArea({ label, hint, error, className, ...input }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      {(id, describedBy) => (
        <textarea id={id} className={styles.input} aria-invalid={!!error || undefined} aria-describedby={describedBy} rows={4} {...input} />
      )}
    </FieldShell>
  )
}

export function SelectField({ label, hint, error, className, children, ...select }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      {(id, describedBy) => (
        <select id={id} className={styles.input} aria-describedby={describedBy} {...select}>
          {children}
        </select>
      )}
    </FieldShell>
  )
}

type ToggleProps = { label: string; checked: boolean; onChange: (checked: boolean) => void; hint?: string; disabled?: boolean }

export function Toggle({ label, checked, onChange, hint, disabled }: ToggleProps) {
  return (
    <label className={styles.toggle}>
      <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className={styles.switch} aria-hidden="true" />
      <span>
        <span className={styles.toggleLabel}>{label}</span>
        {hint ? <span className={styles.hint}>{hint}</span> : null}
      </span>
    </label>
  )
}

type TagInputProps = Common & { value: string[]; onChange: (value: string[]) => void; placeholder?: string }

/** Chips with an input: Enter or comma adds, × removes. */
export function TagInput({ label, hint, error, className, value, onChange, placeholder }: TagInputProps) {
  const [draft, setDraft] = useState('')
  // "Scissors, fades" becomes two tags: phone keyboards often don't send a "," key press, so the whole line arrives
  // on blur
  const add = () => {
    const added = splitList([draft]).filter((tag) => !value.some((v) => v.toLowerCase() === tag.toLowerCase()))
    if (added.length) onChange([...value, ...added])
    setDraft('')
  }
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add()
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      {(id, describedBy) => (
        <div className={styles.tags}>
          {value.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
              <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter((t) => t !== tag))}>
                <Icon name="close" size={12} strokeWidth={2} />
              </button>
            </span>
          ))}
          <input
            id={id}
            className={styles.tagInput}
            value={draft}
            placeholder={value.length ? '' : placeholder}
            aria-describedby={describedBy}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={add}
          />
        </div>
      )}
    </FieldShell>
  )
}
