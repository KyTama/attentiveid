import { useCallback, useEffect, useRef, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { SiteFooter } from '@/components/landing/SiteFooter'

export const OUR_SERVICES_ORIGIN = 'https://ourservices.attentiveid.com'

/** The catalog follows the landing page's language: `?lang=` on first load, a message when the visitor switches. */
export const ourServicesUrl = (lang: 'id' | 'en') => `${OUR_SERVICES_ORIGIN}/?lang=${lang}`

/** "Layanan kami": the services, prices and psychologists site, shown inside the landing page's own header and footer. */
export function OurServicesPage() {
  const { t, i18n } = useTranslation()
  const lang: 'id' | 'en' = (i18n.language || 'id').startsWith('en') ? 'en' : 'id'
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState<number | null>(null)
  // The first address keeps the language it was opened with; later changes go by message so the frame does not reload.
  const [initialSrc] = useState(() => ourServicesUrl(lang))

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

  // The catalog reports how tall its content is, so the page scrolls once instead of twice.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== OUR_SERVICES_ORIGIN || event.source !== frameRef.current?.contentWindow) return
      const data = event.data as { type?: string; height?: unknown } | null
      if (data?.type === 'attentive-services-height' && typeof data.height === 'number' && Number.isFinite(data.height)) {
        setHeight(Math.min(Math.max(Math.ceil(data.height), 480), 20000))
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbf8f2] text-secondary">
      <SiteHeader />
      <main>
        <h1 className="sr-only" data-route-heading tabIndex={-1}>
          {t('homepage.nav.ourServices')}
        </h1>
        <iframe
          className="block w-full border-0 bg-white"
          loading="lazy"
          onLoad={sendLang}
          ref={frameRef}
          referrerPolicy="strict-origin-when-cross-origin"
          src={initialSrc}
          style={{ height: height ?? 'calc(100dvh - 4.5rem)', minHeight: 640 }}
          title={t('homepage.nav.ourServices')}
        />
        <div className="flex justify-center px-4 py-4">
          <a
            className="inline-flex items-center gap-2 rounded-full border border-secondary/15 bg-white px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-secondary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            href={ourServicesUrl(lang)}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('homepage.nav.ourServicesOpen', 'Buka di tab baru')}
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
