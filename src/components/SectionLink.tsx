import type { AnchorHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { useIsHomePage } from '../hooks/useIsHomePage'

type SectionLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  /** Id of a homepage section, e.g. "services" */
  section: string
}

/** A link to a homepage section: a plain "#id" jump on the homepage, a visit to "/#id" (no reload) elsewhere. */
export function SectionLink({ section, ...props }: SectionLinkProps) {
  const isHome = useIsHomePage()
  if (isHome) return <a href={`#${section}`} {...props} />
  return <Link to={{ pathname: '/', hash: `#${section}` }} {...props} />
}
