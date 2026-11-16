import { useEffect, useState } from 'react'
import { DEFAULT_SITE_SETTINGS, mergeSiteSettings, type SiteSettings } from '@attentiveid/shared'

let cached: SiteSettings = DEFAULT_SITE_SETTINGS
let inflight: Promise<SiteSettings> | null = null
const listeners = new Set<(settings: SiteSettings) => void>()

const publish = (settings: SiteSettings) => {
  cached = settings
  listeners.forEach((listener) => listener(settings))
}

/** Loads the settings once per page load; the defaults are used until (and if never) they arrive. */
export function loadSiteSettings(force = false): Promise<SiteSettings> {
  if (inflight && !force) return inflight
  inflight = (async () => {
    try {
      const response = await fetch('/api/content/site-settings')
      const json = response.ok ? await response.json() : null
      const next = mergeSiteSettings(json?.settings)
      publish(next)
      return next
    } catch {
      return cached
    }
  })()
  return inflight
}

/** Used by the portal after saving so the open page picks up the new values. */
export const setSiteSettings = (settings: SiteSettings) => publish(settings)

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState(cached)
  useEffect(() => {
    listeners.add(setSettings)
    void loadSiteSettings()
    return () => {
      listeners.delete(setSettings)
    }
  }, [])
  return settings
}
