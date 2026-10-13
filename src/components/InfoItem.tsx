import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import styles from './InfoItem.module.css'

type InfoItemProps = {
  icon: IconName
  /** Main value; pass an array for multiple lines */
  value: ReactNode | ReactNode[]
  /** Optional secondary detail line under the value */
  detail?: ReactNode
  caption: string
  href?: string
  className?: string
}

export function InfoItem({ icon, value, detail, caption, href, className }: InfoItemProps) {
  const lines = Array.isArray(value) ? value : [value]
  const content = (
    <>
      <span className={styles.ring}>
        <Icon name={icon} size={13} strokeWidth={1.7} />
      </span>
      <span className={styles.text}>
        {lines.map((line, i) => (
          <span key={i} className={styles.value}>
            {line}
          </span>
        ))}
        {detail ? <span className={styles.detail}>{detail}</span> : null}
        <span className={styles.caption}>{caption}</span>
      </span>
    </>
  )

  const classes = [styles.item, className].filter(Boolean).join(' ')
  return href ? (
    <a href={href} className={`${classes} ${styles.link}`}>
      {content}
    </a>
  ) : (
    <div className={classes}>{content}</div>
  )
}
