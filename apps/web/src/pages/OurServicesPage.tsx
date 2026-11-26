import { useCallback, useEffect, useRef, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { safeServicesHash, serviceSlugHash, SERVICE_SLUG } from '@/features/our-services/links'

export const OUR_SERVICES_ORIGIN = 'https://ourservices.attentiveid.com'

/** The catalog follows the landing page's language: `?lang=` on first load, a message when the visitor switches. */
export const ourServicesUrl = (lang: 'id' | 'en') => `${OUR_SERVICES_ORIGIN}/?lang=${lang}`

/** A height the catalog may report: anything outside is ignored rather than believed. */
const MIN_FRAME_HEIGHT = 200
const MAX_FRAME_HEIGHT = 60_000

/** "Layanan kami": the services, prices and psychologists site, shown inside the landing page's own header and footer. */
export function OurServicesPage() {
  const { t, i18n } = useTranslation()
  const lang: 'id' | 'en' = (i18n.language || 'id').startsWith('en') ? 'en' : 'id'
  const frameRef = useRef<HTMLIFrameElement>(null)
  const navigate = useNavigate()
  // /our-services#detail-... opens that service inside the frame (the part after # is the services site's own address).
  // /our-services/<slug> is the shareable form of the same thing.
  const { slug } = useParams()
  const location = useLocation()
  const hash = safeServicesHash(location.hash) || serviceSlugHash(slug)
  // True when the address changed because the catalog said so; the frame already shows it and must not be touched.
  const fromCatalog = Boolean((location.state as { fromCatalog?: boolean } | null)?.fromCatalog)
  // The first address keeps the language it was opened with; later changes go by message so the frame does not reload.
  const [initialBase] = useState(() => ourServicesUrl(lang))
  const [frame, setFrame] = useState({ src: `${initialBase}${hash}`, key: location.key })
  // A link followed on this site (header, footer, a shared address) opens that address in a fresh frame.
  if (!fromCatalog && frame.key !== location.key) setFrame({ src: `${initialBase}${hash}`, key: location.key })
  // Until the catalog reports its height, the frame fills the window and scrolls by itself.
  const [measured, setMeasured] = useState<{ key: string; height: number } | null>(null)
  const height = measured?.key === frame.key ? measured.height : null

  useEffect(() => {
    const previous = document.title
    document.title = `${t('homepage.nav.ourServices')} — Attentive.id`
    return () => {
      document.title = previous
    }
  }, [t])

  const send = useCallback((message: Record<string, unknown>) => {
    frameRef.current?.contentWindow?.postMessage(message, OUR_SERVICES_ORIGIN)
  }, [])

  const sendLang = useCallback(() => send({ type: 'attentive-lang', lang }), [lang, send])

  useEffect(() => {
    sendLang()
  }, [sendLang])

  // Which part of the (page-high) frame is on screen, so the catalog can keep its floating buttons in view.
  const sendViewport = useCallback(() => {
    const element = frameRef.current
    if (!element || height === null) return
    const box = element.getBoundingClientRect()
    const headerBottom = Math.max(0, document.querySelector('header')?.getBoundingClientRect().bottom ?? 0)
    const top = Math.max(box.top, headerBottom)
    const bottom = Math.min(box.bottom, window.innerHeight)
    send({ type: 'attentive-viewport', top: Math.round(top - box.top), height: Math.max(0, Math.round(bottom - top)) })
  }, [height, send])

  useEffect(() => {
    sendViewport()
    window.addEventListener('scroll', sendViewport, { passive: true })
    window.addEventListener('resize', sendViewport)
    return () => {
      window.removeEventListener('scroll', sendViewport)
      window.removeEventListener('resize', sendViewport)
    }
  }, [sendViewport])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== OUR_SERVICES_ORIGIN || event.source !== frameRef.current?.contentWindow) return
      const data = event.data as { type?: unknown; id?: unknown; height?: unknown } | null
      if (data?.type === 'attentive-height') {
        const next = data.height
        if (typeof next !== 'number' || !Number.isFinite(next) || next < MIN_FRAME_HEIGHT || next > MAX_FRAME_HEIGHT) return
        setMeasured({ key: frame.key, height: Math.ceil(next) })
        return
      }
      // The catalog says which service is open: the address follows (an empty id goes back to /our-services).
      if (data?.type !== 'attentive-service' || typeof data.id !== 'string') return
      if (data.id && !SERVICE_SLUG.test(data.id)) return
      if (serviceSlugHash(data.id) === hash) return
      window.scrollTo({ top: 0, left: 0 })
      navigate(data.id ? `/our-services/${data.id}` : '/our-services', { replace: true, state: { fromCatalog: true } })
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [frame.key, hash, navigate])

  // One scrollbar either way: with a height the page scrolls and the footer follows the catalog; without one the page is
  // exactly as tall as the window and the catalog scrolls inside the frame.
  const full = height !== null
  return (
    <div className={`flex flex-col bg-[#fbf8f2] text-secondary ${full ? 'min-h-screen' : 'h-dvh overflow-hidden'}`}>
      <SiteHeader />
      <main className={`flex flex-col ${full ? '' : 'min-h-0 flex-1'}`}>
        <h1 className="sr-only" data-route-heading tabIndex={-1}>
          {t('homepage.nav.ourServices')}
        </h1>
        <iframe
          className={`block w-full border-0 bg-white ${full ? 'shrink-0' : 'min-h-0 flex-1'}`}
          key={frame.key}
          onLoad={() => {
            sendLang()
            sendViewport()
          }}
          ref={frameRef}
          referrerPolicy="strict-origin-when-cross-origin"
          src={frame.src}
          style={full ? { height } : undefined}
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
      {full && <SiteFooter />}
    </div>
  )
}
