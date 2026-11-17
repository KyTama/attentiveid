import { useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { SiteFooter } from '@/components/landing/SiteFooter'

export const OUR_SERVICES_URL = 'https://ourservices.attentiveid.com/'

/** "Layanan kami": the services, prices and psychologists site, shown inside the landing page's own header and footer. */
export function OurServicesPage() {
  const { t } = useTranslation()

  useEffect(() => {
    const previous = document.title
    document.title = `${t('homepage.nav.ourServices')} — Attentive.id`
    return () => {
      document.title = previous
    }
  }, [t])

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbf8f2] text-secondary">
      <SiteHeader />
      <main>
        <h1 className="sr-only" data-route-heading tabIndex={-1}>
          {t('homepage.nav.ourServices')}
        </h1>
        <iframe
          className="block h-[calc(100dvh-4.5rem)] min-h-[640px] w-full border-0 bg-white"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          src={OUR_SERVICES_URL}
          title={t('homepage.nav.ourServices')}
        />
        <div className="flex justify-center px-4 py-4">
          <a
            className="inline-flex items-center gap-2 rounded-full border border-secondary/15 bg-white px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-secondary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            href={OUR_SERVICES_URL}
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
