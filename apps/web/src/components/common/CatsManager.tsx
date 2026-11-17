import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { catsAllowedOn } from '@attentiveid/shared'
import { loadSiteSettings, useSiteSettings } from '@/features/site-settings/use-site-settings'
import { useCatPreference } from '@/features/cats/cat-preference'
import { guardCatsOverFrames } from './cats-frame-guard'

interface CatsApi {
  start: (options?: { root?: string | Element; topbar?: string }) => boolean | void
  stop: () => void
  running: () => boolean
}

declare global {
  interface Window {
    AttentiveCats?: CatsApi
  }
}

// Bump the number when /cats/kucing.js changes so browsers fetch the new file.
const CATS_SCRIPT = '/cats/kucing.js?v=1'

let loading: Promise<CatsApi | null> | null = null

/** The cats are a 3D script (about 700 KB): fetched only when a page really shows them. */
const loadCats = (): Promise<CatsApi | null> => {
  if (window.AttentiveCats) return Promise.resolve(window.AttentiveCats)
  loading ??= new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = CATS_SCRIPT
    script.async = true
    script.onload = () => resolve(window.AttentiveCats ?? null)
    script.onerror = () => {
      loading = null
      resolve(null)
    }
    document.head.appendChild(script)
  })
  return loading
}

const prefersReducedMotion = () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Walking cats on the public pages the admin has left on (portal: Pengaturan Situs), for visitors who turned them on with the
 * cat button. They are never shown on the forms or the lights page, and not for visitors who asked their device for less motion.
 */
export function CatsManager() {
  const { pathname } = useLocation()
  const { cats } = useSiteSettings()
  // The visitor decides: the admin only says where cats are allowed. Off until the visitor turns them on.
  const [catsOn] = useCatPreference()
  // Until the real settings have arrived the defaults ("on") are in use: do not start the cats on those, or they would
  // flash in and walk out again on a site where the admin has switched them off.
  const [settingsReady, setSettingsReady] = useState(false)
  useEffect(() => {
    let active = true
    void loadSiteSettings().then(() => active && setSettingsReady(true))
    return () => {
      active = false
    }
  }, [])
  const wanted = settingsReady && catsOn && catsAllowedOn(cats, pathname) && !prefersReducedMotion()

  useEffect(() => {
    if (!wanted) {
      window.AttentiveCats?.stop()
      return
    }
    let cancelled = false
    let unguard: (() => void) | null = null
    void loadCats().then((api) => {
      // The visitor may have moved on while the script was loading (the effect then ran again and cancelled this one).
      if (cancelled || !api) return
      if (!api.running()) api.start({ root: document.body, topbar: 'header' })
      // Over an embedded frame (Layanan kami) the page cannot see the mouse: keep the cats playable there.
      unguard = guardCatsOverFrames(api)
    })
    return () => {
      cancelled = true
      unguard?.()
    }
  }, [wanted])

  useEffect(() => () => window.AttentiveCats?.stop(), [])

  return null
}
