import { Instagram, MapPin, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { BRAND } from '@/assets/images'
import { contact, createWhatsAppLink, defaultContactMessage } from '@/data/contact'

export function SiteFooter() {
  const { t } = useTranslation()
  const whatsappUrl = createWhatsAppLink(defaultContactMessage)

  return (
    <footer className="border-t border-secondary/10 bg-[#f3ede3] px-5 py-12 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <img alt="Attentive.id" height="56" src={BRAND.logo} width="179" />
          <p className="mt-5 text-sm leading-6 text-secondary/65">{t('homepage.footer.statement')}</p>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">{t('homepage.footer.explore')}</h2>
          <div className="mt-3 grid text-sm text-secondary/70">
            <a className="inline-flex min-h-11 items-center" href="/#support">{t('homepage.nav.support')}</a>
            <Link className="inline-flex min-h-11 items-center" to="/psychologists">{t('homepage.nav.psychologists')}</Link>
            <a className="inline-flex min-h-11 items-center" href="/#faq">{t('homepage.nav.faq')}</a>
          </div>
        </div>
        <div id="contact">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">{t('homepage.footer.contact')}</h2>
          <div className="mt-5 grid gap-4 text-sm text-secondary/70">
            <a className="flex min-h-11 items-center gap-3" href={whatsappUrl} rel="noopener noreferrer" target="_blank">
              <MessageCircle aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={18} />
              {contact.whatsapp.displayNumber}
            </a>
            <a className="flex min-h-11 items-start gap-3 py-2" href={contact.location.mapsUrl} rel="noopener noreferrer" target="_blank">
              <MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={18} />
              {contact.location.address}
            </a>
            <a className="flex min-h-11 items-center gap-3" href={contact.social.instagram} rel="noopener noreferrer" target="_blank">
              <Instagram aria-hidden="true" className="text-primary" size={18} />
              @attentive.id
            </a>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-7xl border-t border-secondary/10 pt-6 text-xs text-secondary/50">
        © {new Date().getFullYear()} Attentive.id. {t('homepage.footer.rights')}
      </p>
    </footer>
  )
}
