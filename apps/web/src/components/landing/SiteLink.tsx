import type { MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface SiteLinkProps {
  /** "/page", "/#section" or a full address. */
  url: string
  className: string
  children: ReactNode
  /** Called on any click, e.g. to close a menu. */
  onNavigate?: () => void
  /** Called for section links ("/#..."), so the homepage can scroll smoothly. */
  onAnchorClick?: (event: MouseEvent<HTMLAnchorElement>, url: string) => void
}

/** An editable menu/footer link: stays in the app for own pages, opens a new tab for other sites. */
export function SiteLink({ url, className, children, onNavigate, onAnchorClick }: SiteLinkProps) {
  if (url.startsWith('/') && !url.includes('#')) {
    return (
      <Link className={className} onClick={onNavigate} to={url}>
        {children}
      </Link>
    )
  }
  const external = !url.startsWith('/')
  return (
    <a
      className={className}
      href={url}
      onClick={(event) => {
        onNavigate?.()
        if (!external) onAnchorClick?.(event, url)
      }}
      rel={external ? 'noopener noreferrer' : undefined}
      target={external ? '_blank' : undefined}
    >
      {children}
    </a>
  )
}
