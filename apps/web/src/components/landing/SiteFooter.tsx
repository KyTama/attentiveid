import { Clock, ExternalLink, Instagram, MapPin, MessageCircle, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { clinicBranches, contact, createWhatsAppLink, defaultContactMessage } from '@/data/contact'

export function SiteFooter() {
  const { t } = useTranslation()
  const whatsappUrl = createWhatsAppLink(defaultContactMessage)

  return (
    <footer className="border-t border-secondary/10 bg-[#f3ede3] px-5 py-12 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_1.3fr_1fr]">
        {/* Brand statement */}
        <div className="max-w-sm">
          <Link className="inline-block outline-none focus-visible:ring-2 focus-visible:ring-primary" to="/">
            <img alt="Attentive.id" className="h-auto w-44" height="144" loading="lazy" src="/images/figma/attentive-logo.webp" width="528" />
          </Link>
          <p className="mt-5 text-sm leading-6 text-secondary/80">{t('homepage.footer.statement')}</p>
          <div className="mt-6 flex items-center gap-2 text-xs font-medium text-secondary/70">
            <Clock aria-hidden="true" className="size-4 text-primary" />
            <span>{t('homepage.footer.hours', 'Senin – Sabtu: 09.00 – 21.00 WIB')}</span>
          </div>
        </div>

        {/* Explore Links */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">{t('homepage.footer.explore')}</h2>
          <div className="mt-4 grid text-sm text-secondary/70">
            <a className="inline-flex min-h-10 items-center hover:text-secondary" href="/#support">{t('homepage.nav.support')}</a>
            <Link className="inline-flex min-h-10 items-center hover:text-secondary" to="/psychologists">{t('homepage.nav.psychologists')}</Link>
            <a className="inline-flex min-h-10 items-center hover:text-secondary" href="/#locations">{t('homepage.nav.locations', 'Lokasi')}</a>
            <Link className="inline-flex min-h-10 items-center hover:text-secondary" to="/articles">{t('homepage.nav.articles', 'Artikel')}</Link>
            <a className="inline-flex min-h-10 items-center hover:text-secondary" href="/#faq">{t('homepage.nav.faq')}</a>
          </div>
        </div>

        {/* Practice Locations */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">{t('homepage.footer.locations', 'Lokasi Praktik')}</h2>
          <div className="mt-4 grid gap-4 text-xs text-secondary/75">
            {clinicBranches.map((branch) => {
              const isOpeningSoon = branch.status === 'opening_soon'
              return (
                <div className="rounded-xl border border-secondary/10 bg-white/60 p-3" key={branch.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-secondary text-[0.8rem]">{branch.name}</span>
                    {isOpeningSoon && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#c27d60]/30 bg-[#c27d60]/10 px-2 py-0.5 text-[0.65rem] font-semibold text-[#a85a3c]">
                        <Sparkles aria-hidden="true" className="size-2.5 text-[#c27d60]" />
                        {t('homepage.footer.openingSoonBadge', 'Opening Soon')}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 leading-relaxed text-secondary/70">{branch.address}</p>
                  {branch.mapsUrl && (
                    <a
                      className="mt-2 inline-flex items-center gap-1 font-semibold text-primary hover:underline text-[0.75rem]"
                      href={branch.mapsUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <MapPin aria-hidden="true" className="size-3" />
                      {t('homepage.footer.openInMaps', 'Buka Google Maps')}
                      <ExternalLink aria-hidden="true" className="size-2.5 opacity-60" />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Contact info */}
        <div id="contact">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">{t('homepage.footer.contact')}</h2>
          <div className="mt-4 grid gap-3 text-sm text-secondary/70">
            <a className="flex min-h-11 items-center gap-3 rounded-lg border border-secondary/10 bg-white/60 p-2.5 hover:bg-white transition-colors" href={whatsappUrl} rel="noopener noreferrer" target="_blank">
              <MessageCircle aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={18} />
              <div>
                <span className="block text-[0.7rem] uppercase tracking-wider text-secondary/60">WhatsApp Hotline</span>
                <span className="font-bold text-secondary text-xs">{contact.whatsapp.displayNumber}</span>
              </div>
            </a>
            <a className="flex min-h-11 items-center gap-3 rounded-lg border border-secondary/10 bg-white/60 p-2.5 hover:bg-white transition-colors" href={contact.social.instagram} rel="noopener noreferrer" target="_blank">
              <Instagram aria-hidden="true" className="shrink-0 text-primary" size={18} />
              <div>
                <span className="block text-[0.7rem] uppercase tracking-wider text-secondary/60">Instagram Official</span>
                <span className="font-bold text-secondary text-xs">@attentive.id</span>
              </div>
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
