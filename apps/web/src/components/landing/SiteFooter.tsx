import { ExternalLink, Instagram, MapPin, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { clinicBranches, contact, createWhatsAppLink, defaultContactMessage } from '@/data/contact'

export function SiteFooter() {
  const { t } = useTranslation()
  const whatsappUrl = createWhatsAppLink(defaultContactMessage)

  return (
    <footer className="border-t border-secondary/10 bg-[#f3ede3] px-5 py-12 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_0.8fr_1.5fr]">
        {/* Brand statement */}
        <div className="max-w-sm">
          <Link className="inline-block outline-none focus-visible:ring-2 focus-visible:ring-primary" to="/">
            <img alt="Attentive.id" className="h-auto w-44" height="144" loading="lazy" src="/images/figma/attentive-logo.webp" width="528" />
          </Link>
          <p className="mt-5 text-sm leading-6 text-secondary/80">{t('homepage.footer.statement')}</p>
        </div>

        {/* Explore Links */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">{t('homepage.footer.explore')}</h2>
          <div className="mt-3 grid text-sm text-secondary/70">
            <a className="inline-flex min-h-9 items-center hover:text-secondary" href="/#support">{t('homepage.nav.support')}</a>
            <Link className="inline-flex min-h-9 items-center hover:text-secondary" to="/psychologists">{t('homepage.nav.psychologists')}</Link>
            <a className="inline-flex min-h-9 items-center hover:text-secondary" href="/#locations">{t('homepage.nav.locations', 'Lokasi')}</a>
            <Link className="inline-flex min-h-9 items-center hover:text-secondary" to="/articles">{t('homepage.nav.articles', 'Artikel')}</Link>
            <a className="inline-flex min-h-9 items-center hover:text-secondary" href="/#faq">{t('homepage.nav.faq')}</a>
          </div>
        </div>

        {/* Locations & Contact */}
        <div id="contact">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">
            {t('homepage.footer.locations', 'Lokasi Praktik')} & {t('homepage.footer.contact', 'Kontak')}
          </h2>

          <div className="mt-3 space-y-3 text-xs text-secondary/75">
            {clinicBranches.map((branch) => {
              const isOpeningSoon = branch.status === 'opening_soon'
              return (
                <div className="flex items-start gap-2.5" key={branch.id}>
                  <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="leading-snug">
                    {branch.mapsUrl && !isOpeningSoon ? (
                      <a
                        className="inline-flex items-center gap-1 font-semibold text-secondary hover:underline"
                        href={branch.mapsUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {branch.name}
                        <ExternalLink aria-hidden="true" className="size-2.5 opacity-50" />
                      </a>
                    ) : (
                      <span className="font-semibold text-secondary">
                        {branch.name}
                      </span>
                    )}

                    {isOpeningSoon && (
                      <span className="ml-2 inline-block rounded-full bg-[#c27d60]/15 px-2 py-0.5 text-[0.65rem] font-semibold text-[#a85a3c]">
                        {t('homepage.footer.openingSoonBadge', 'Opening Soon')}
                      </span>
                    )}

                    <span className="block text-secondary/65 mt-0.5">
                      {branch.address}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Clean contact links */}
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-secondary/10 pt-4 text-xs text-secondary/75">
            <a className="inline-flex items-center gap-2 hover:text-secondary" href={whatsappUrl} rel="noopener noreferrer" target="_blank">
              <MessageCircle aria-hidden="true" className="size-4 text-primary" />
              <span>{contact.whatsapp.displayNumber}</span>
            </a>
            <a className="inline-flex items-center gap-2 hover:text-secondary" href={contact.social.instagram} rel="noopener noreferrer" target="_blank">
              <Instagram aria-hidden="true" className="size-4 text-primary" />
              <span>@attentive.id</span>
            </a>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-12 max-w-7xl border-t border-secondary/10 pt-6 text-xs text-secondary/80">
        © {new Date().getFullYear()} Attentive.id. {t('homepage.footer.rights')}
      </p>
    </footer>
  )
}
