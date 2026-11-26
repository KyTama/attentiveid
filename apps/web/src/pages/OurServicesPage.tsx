import { useCallback, useEffect, useRef, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocation, useParams } from 'react-router-dom'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { safeServicesHash, serviceSlugHash, SERVICE_SLUG } from '@/features/our-services/links'

export const OUR_SERVICES_ORIGIN = 'https://ourservices.attentiveid.com'

/** The catalog follows the landing page's language: `?lang=` on first load, a message when the visitor switches. */
export const ourServicesUrl = (lang: 'id' | 'en') => `${OUR_SERVICES_ORIGIN}/?lang=${lang}`

/** "Layanan kami": the services, prices and psychologists site, shown under the landing page's own header. */
export function OurServicesPage() {
  const { t, i18n } = useTranslation()
  const lang: 'id' | 'en' = (i18n.language || 'id').startsWith('en') ? 'en' : 'id'
  const frameRef = useRef<HTMLIFrameElement>(null)
  // /our-services#detail-... opens that service inside the frame (the part after # is the services site's own address).
  // /our-services/<slug> is the shareable form of the same thing.
  const { slug } = useParams()
  const hash = safeServicesHash(useLocation().hash) || serviceSlugHash(slug)
  // The first address keeps the language it was opened with; later changes go by message so the frame does not reload.
  const [initialBase] = useState(() => ourServicesUrl(lang))
  const frameSrc = `${initialBase}${hash}`

  useEffect(() => {
    const previous = document.title
    document.title = `${t('homepage.nav.ourServices')} — Attentive.id`
    return () => {
      document.title = previous
    }
  }, [t])

  const sendLang = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage({ type: 'attentive-lang', lang }, OUR_SERVICES_ORIGIN)
  }, [lang])

  useEffect(() => {
    sendLang()
  }, [sendLang])

  // When the catalog says which service is open ({ type: 'attentive-service', id }), the address bar shows it. The address is
  // replaced without telling the router, so the frame is not reloaded. An empty id goes back to /our-services.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== OUR_SERVICES_ORIGIN || event.source !== frameRef.current?.contentWindow) return
      const data = event.data as { type?: unknown; id?: unknown } | null
      if (data?.type !== 'attentive-service' || typeof data.id !== 'string') return
      if (data.id && !SERVICE_SLUG.test(data.id)) return
      window.history.replaceState(window.history.state, '', data.id ? `/our-services/${data.id}` : '/our-services')
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // One scrollbar only: the page is exactly as tall as the window and the catalog scrolls inside the frame. A footer under the
  // frame would give the page a second scrollbar of its own, so this page has none.
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#fbf8f2] text-secondary">
      <SiteHeader />
      <main className="flex min-h-0 flex-1 flex-col">
        <h1 className="sr-only" data-route-heading tabIndex={-1}>
          {t('homepage.nav.ourServices')}
        </h1>
        {/* The frame fills the window under the header (not the height of its content): the catalog keeps its chat assistant
            and other floating buttons pinned to the bottom of the frame. */}
        <iframe
          className="block min-h-0 w-full flex-1 border-0 bg-white"
          onLoad={sendLang}
          ref={frameRef}
          referrerPolicy="strict-origin-when-cross-origin"
          src={frameSrc}
          title={t('homepage.nav.ourServices')}
        />
        <div className="flex justify-center px-4 py-1.5">
          <a
            className="inline-flex items-center gap-2 rounded-full border border-secondary/15 bg-white px-4 py-1.5 text-xs font-semibold text-secondary transition-colors hover:bg-secondary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            href={`${ourServicesUrl(lang)}${hash}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('homepage.nav.ourServicesOpen', 'Buka di tab baru')}
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        </div>
      </main>
    </div>
  )
}
