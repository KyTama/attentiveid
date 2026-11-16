import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSiteSettings } from '@/features/site-settings/use-site-settings'

const DEFAULT_ICON_HREF = '/images/favicon.webp'

/**
 * Applies the browser tab settings from the portal: the tab title on the home page (other pages keep
 * their own titles) and the tab icon everywhere on the public site.
 */
export function BrowserTabManager() {
  const { pathname } = useLocation()
  const { i18n } = useTranslation()
  const { browserTab } = useSiteSettings()
  const isEn = (i18n.resolvedLanguage || i18n.language || 'id').startsWith('en')
  const title = (isEn ? browserTab.titleEn : browserTab.titleId) || browserTab.titleId

  useEffect(() => {
    if (pathname === '/' && title) document.title = title
  }, [pathname, title])

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
    if (!link) return
    const href = browserTab.faviconUrl || DEFAULT_ICON_HREF
    if (link.getAttribute('href') !== href) {
      link.removeAttribute('type')
      link.setAttribute('href', href)
    }
  }, [browserTab.faviconUrl])

  return null
}
