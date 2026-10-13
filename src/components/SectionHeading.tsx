import type { ReactNode } from 'react'
import styles from './SectionHeading.module.css'

type SectionHeadingProps = {
  eyebrow: string
  title: ReactNode
  /** 'sm' is the slightly smaller H2 used in the About / Testimonials band */
  size?: 'md' | 'sm'
  /** id for the heading, so the section can reference it with aria-labelledby */
  id?: string
  className?: string
}

export function SectionHeading({ eyebrow, title, size = 'md', id, className }: SectionHeadingProps) {
  return (
    <div className={[styles.heading, size === 'sm' && styles.sm, className].filter(Boolean).join(' ')}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className={size === 'sm' ? styles.titleSm : styles.title}>
        {title}
      </h2>
    </div>
  )
}
