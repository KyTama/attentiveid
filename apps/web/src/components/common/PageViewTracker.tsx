import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { normalizeTrackedPath } from '@attentiveid/shared'
import { trackPageView } from '@/features/admin-tools/service'

const SESSION_KEY = 'attentive-visit-counted'

/**
 * Counts a visit to the main pages only (see TRACKED_PAGES); sub pages are ignored.
 * Skips staff sessions on the dashboard and anyone who sent "Do Not Track".
 */
export function PageViewTracker() {
  const { pathname } = useLocation()

  useEffect(() => {
    const path = normalizeTrackedPath(pathname)
    if (!path) return
    if (typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || (window as { doNotTrack?: string }).doNotTrack === '1')) return

    let newSession = false
    try {
      newSession = window.sessionStorage.getItem(SESSION_KEY) !== '1'
      if (newSession) window.sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      newSession = false
    }
    trackPageView(path, newSession)
  }, [pathname])

  return null
}
