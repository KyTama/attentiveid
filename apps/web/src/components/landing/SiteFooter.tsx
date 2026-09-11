import { ExternalLink, Instagram, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { clinicBranches, contact, createWhatsAppLink, defaultContactMessage } from '@/data/contact'

export function SiteFooter() {
  const { t } = useTranslation()
  const whatsappUrl = createWhatsAppLink(defaultContactMessage)

  return (
    <footer className="border-t border-secondary/10 bg-[#f3ede3] px-5 py-8 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand statement */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link className="inline-block outline-none focus-visible:ring-2 focus-visible:ring-primary" to="/">
            <img alt="Attentive.id" className="h-auto w-36" height="144" loading="lazy" src="/images/figma/attentive-logo.webp" width="528" />
          </Link>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-secondary/75">{t('homepage.footer.statement')}</p>
        </div>

        {/* Explore Links */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">{t('homepage.footer.explore')}</h2>
          <div className="mt-3 grid gap-1.5 text-xs text-secondary/70">
            <a className="inline-flex min-h-7 items-center hover:text-secondary" href="/#support">{t('homepage.nav.support')}</a>
            <Link className="inline-flex min-h-7 items-center hover:text-secondary" to="/psychologists">{t('homepage.nav.psychologists')}</Link>
            <a className="inline-flex min-h-7 items-center hover:text-secondary" href="/#locations">{t('homepage.nav.locations', 'Lokasi')}</a>
            <Link className="inline-flex min-h-7 items-center hover:text-secondary" to="/articles">{t('homepage.nav.articles', 'Artikel')}</Link>
            <a className="inline-flex min-h-7 items-center hover:text-secondary" href="/#faq">{t('homepage.nav.faq')}</a>
          </div>
        </div>

        {/* Location Linked Titles */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
            {t('homepage.footer.locations', 'Lokasi Praktik')}
          </h2>
          <div className="mt-3 grid gap-1.5 text-xs text-secondary/70">
            {clinicBranches.map((branch) => {
              const isOpeningSoon = branch.status === 'opening_soon'
              const displayName = branch.name.replace(/^Attentive\s+/, '')
              return (
                <a
                  key={branch.id}
                  className="inline-flex min-h-7 items-center gap-1.5 hover:text-secondary"
                  href={branch.mapsUrl && !isOpeningSoon ? branch.mapsUrl : '/#locations'}
                  rel={branch.mapsUrl && !isOpeningSoon ? 'noopener noreferrer' : undefined}
                  target={branch.mapsUrl && !isOpeningSoon ? '_blank' : undefined}
                >
                  <span className="hover:underline">{displayName}</span>
                  {isOpeningSoon ? (
                    <span className="rounded-full bg-[#c27d60]/15 px-1.5 py-0.5 text-[0.625rem] font-semibold text-[#a85a3c]">
                      {t('homepage.footer.openingSoonBadge', 'Opening Soon')}
                    </span>
                  ) : (
                    <ExternalLink aria-hidden="true" className="size-2.5 opacity-40" />
                  )}
                </a>
              )
            })}
          </div>
        </div>

        {/* Contact Links */}
        <div id="contact">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
            {t('homepage.footer.contact', 'Kontak')}
          </h2>
          <div className="mt-3 grid gap-1.5 text-xs text-secondary/70">
            <a className="inline-flex min-h-7 items-center gap-2 hover:text-secondary" href={whatsappUrl} rel="noopener noreferrer" target="_blank">
              <MessageCircle aria-hidden="true" className="size-3.5 text-primary" />
              <span>{contact.whatsapp.displayNumber}</span>
            </a>
            <a className="inline-flex min-h-7 items-center gap-2 hover:text-secondary" href={contact.social.instagram} rel="noopener noreferrer" target="_blank">
              <Instagram aria-hidden="true" className="size-3.5 text-primary" />
              <span>@attentive.id</span>
            </a>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-7xl border-t border-secondary/10 pt-4 text-[0.7rem] text-secondary/60">
        © {new Date().getFullYear()} Attentive.id. {t('homepage.footer.rights')}
      </p>
    </footer>
  )
}
