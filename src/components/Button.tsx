import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary'
type Size = 'sm' | 'md'

type CommonProps = {
  variant?: Variant
  size?: Size
  /** Leading icon */
  icon?: IconName
  /** Trailing → arrow */
  arrow?: boolean
  children: ReactNode
  className?: string
}

type LinkProps = CommonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & { href: string }
type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined }

export type ButtonProps = LinkProps | NativeButtonProps

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', icon, arrow, children, className, ...rest } = props
  const classes = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ')
  const content = (
    <>
      {icon ? <Icon name={icon} size={size === 'sm' ? 14 : 16} strokeWidth={1.7} /> : null}
      <span>{children}</span>
      {arrow ? <Icon name="arrowRight" className={styles.arrow} size={14} strokeWidth={1.7} /> : null}
    </>
  )

  if (rest.href !== undefined) {
    return (
      <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    )
  }
  return (
    <button type="button" className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  )
}
