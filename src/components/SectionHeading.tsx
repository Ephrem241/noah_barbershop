import type { ReactNode } from 'react'
import styles from './SectionHeading.module.css'

type SectionHeadingProps = {
  eyebrow: string
  title: ReactNode
  /** id for the heading, so the section can reference it with aria-labelledby */
  id?: string
  className?: string
}

export function SectionHeading({ eyebrow, title, id, className }: SectionHeadingProps) {
  return (
    <div className={[styles.heading, className].filter(Boolean).join(' ')}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
    </div>
  )
}
