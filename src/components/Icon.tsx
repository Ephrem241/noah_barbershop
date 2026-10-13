import type { ReactNode, SVGProps } from 'react'

type IconDef = { viewBox: string; body: ReactNode; filled?: boolean }

// Thin-line icon set (paths taken from the design export). 24×24 unless noted.
const icons = {
  arrowRight: { viewBox: '0 0 24 24', body: <path d="M5 12h14M13 6l6 6-6 6" /> },
  arrowLeft: { viewBox: '0 0 24 24', body: <path d="M19 12H5M11 6l-6 6 6 6" /> },
  play: { viewBox: '0 0 24 24', filled: true, body: <path d="M8 5.2v13.6a.8.8 0 0 0 1.2.7l10.9-6.8a.8.8 0 0 0 0-1.4L9.2 4.5A.8.8 0 0 0 8 5.2z" /> },
  pause: {
    viewBox: '0 0 24 24',
    filled: true,
    body: (
      <>
        <rect x="6" y="5" width="4.2" height="14" rx="1" />
        <rect x="13.8" y="5" width="4.2" height="14" rx="1" />
      </>
    ),
  },
  telegram: {
    viewBox: '0 0 24 24',
    body: <path d="M21.2 3.6 2.9 10.8c-.8.3-.8 1.4 0 1.7l4.6 1.6 1.8 5.5c.2.7 1.1.9 1.6.4l2.6-2.5 4.6 3.4c.6.4 1.4.1 1.6-.6l3-14.6c.2-.9-.7-1.6-1.5-1.3zM7.5 14.1l10-6.6-7.4 7.7-.4 3.7" />,
  },
  whatsapp: {
    viewBox: '0 0 24 24',
    body: (
      <>
        <path d="M3.6 20.4l1.3-4.4a8.6 8.6 0 1 1 3.3 3.2z" />
        <path d="M9.2 7.9c-.4.2-.9.8-.9 1.6 0 2.4 3.4 5.8 5.9 5.9.8 0 1.4-.5 1.6-.9l.1-.7-1.8-.9-.9.9c-1.1-.4-2.1-1.4-2.6-2.6l.9-.9-.8-1.8z" />
      </>
    ),
  },
  chevronLeft: { viewBox: '0 0 24 24', body: <path d="M15 6l-6 6 6 6" /> },
  chevronRight: { viewBox: '0 0 24 24', body: <path d="M9 6l6 6-6 6" /> },
  calendar: {
    viewBox: '0 0 24 24',
    body: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
  },
  phone: {
    viewBox: '0 0 24 24',
    body: (
      <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2" />
    ),
  },
  pin: {
    viewBox: '0 0 24 24',
    body: (
      <>
        <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" />
        <circle cx="12" cy="9" r="2.5" />
      </>
    ),
  },
  clock: {
    viewBox: '0 0 24 24',
    body: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
  star: {
    viewBox: '0 0 24 24',
    filled: true,
    body: <path d="M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z" />,
  },
  menu: { viewBox: '0 0 24 24', body: <path d="M4 7h16M4 12h16M4 17h16" /> },
  navigate: { viewBox: '0 0 24 24', body: <path d="M3.5 10.6 20 4l-6.6 16.5-2.3-7.2z" /> },
  expand: { viewBox: '0 0 24 24', body: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /> },
  alert: {
    viewBox: '0 0 24 24',
    body: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.4v.1" />
      </>
    ),
  },
  chat: { viewBox: '0 0 24 24', body: <path d="M4 5h16v11H9l-5 4zM8 9.5h8M8 12.5h5" /> },
  sparkle: {
    viewBox: '0 0 24 24',
    body: <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7zM19 16c.2 1.6.8 2.2 2.4 2.4-1.6.2-2.2.8-2.4 2.4-.2-1.6-.8-2.2-2.4-2.4 1.6-.2 2.2-.8 2.4-2.4z" />,
  },
  // admin
  grid: {
    viewBox: '0 0 24 24',
    body: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
  },
  image: {
    viewBox: '0 0 24 24',
    body: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="1.8" />
        <path d="m21 16-5-5-8 9" />
      </>
    ),
  },
  users: {
    viewBox: '0 0 24 24',
    body: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
      </>
    ),
  },
  edit: { viewBox: '0 0 24 24', body: <path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" /> },
  trash: { viewBox: '0 0 24 24', body: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" /> },
  plus: { viewBox: '0 0 24 24', body: <path d="M12 5v14M5 12h14" /> },
  external: { viewBox: '0 0 24 24', body: <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" /> },
  upload: { viewBox: '0 0 24 24', body: <path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4" /> },
  check: { viewBox: '0 0 24 24', body: <path d="m5 12 5 5L20 7" /> },
  logout: { viewBox: '0 0 24 24', body: <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11" /> },
  close: { viewBox: '0 0 24 24', body: <path d="M6 6l12 12M18 6 6 18" /> },
  instagram: {
    viewBox: '0 0 24 24',
    body: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </>
    ),
  },
  facebook: {
    viewBox: '0 0 24 24',
    body: <path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2z" />,
  },
  tiktok: { viewBox: '0 0 24 24', body: <path d="M14 3v12a4 4 0 1 1-4-4M14 3c.5 3 2.5 5 5.5 5" /> },
  // 30×20, solid (logo mark)
  crown: {
    viewBox: '0 0 30 20',
    filled: true,
    body: (
      <>
        <path d="M2.2 4.6 8.6 10 15 2.6 21.4 10l6.4-5.4-2.1 9.8H4.3z" />
        <rect x="4.3" y="16" width="21.4" height="2.4" rx="0.6" />
        <circle cx="2.2" cy="3.9" r="1.5" />
        <circle cx="15" cy="1.7" r="1.5" />
        <circle cx="27.8" cy="3.9" r="1.5" />
      </>
    ),
  },
  scissors: {
    viewBox: '0 0 24 24',
    body: (
      <>
        <circle cx="5.6" cy="18.4" r="3" />
        <circle cx="18.4" cy="18.4" r="3" />
        <path d="M7.7 16.3 19.8 2.6M16.3 16.3 4.2 2.6" />
      </>
    ),
  },
  // admin: services
  bottle: {
    viewBox: '0 0 24 24',
    body: (
      <>
        <path d="M9.6 1.8h4.8v3.6H9.6zM10.2 5.4v2.4l-3 3v10.2a1.2 1.2 0 0 0 1.2 1.2h7.2a1.2 1.2 0 0 0 1.2-1.2V10.8l-3-3V5.4" />
        <path d="M12 13.2c-1.2 1.8-1.8 2.7-1.8 3.6a1.8 1.8 0 0 0 3.6 0c0-.9-.6-1.8-1.8-3.6z" />
      </>
    ),
  },
} satisfies Record<string, IconDef>

export type IconName = keyof typeof icons

type IconProps = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  name: IconName
  size?: number | string
  title?: string
}

export function Icon({ name, size = 16, strokeWidth = 1.6, title, ...rest }: IconProps) {
  const icon: IconDef = icons[name]
  const [, , w, h] = icon.viewBox.split(' ').map(Number)
  const width = typeof size === 'number' && w !== h ? (size * w) / h : size
  return (
    <svg
      viewBox={icon.viewBox}
      width={width}
      height={size}
      fill={icon.filled ? 'currentColor' : 'none'}
      stroke={icon.filled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {icon.body}
    </svg>
  )
}
