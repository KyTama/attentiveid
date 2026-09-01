import { useEffect } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'

export function PublicLayout() {
  const location = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType !== 'POP') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }

    const frame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[data-route-heading]')?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [location.pathname, navigationType])

  return <Outlet />
}
