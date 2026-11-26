import { ExternalLink, Instagram, Linkedin, Mail, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { clinicBranches, defaultContactMessage } from '@/data/contact'
import { useSiteSettings } from '@/features/site-settings/use-site-settings'
import { SiteLink } from './SiteLink'

export function SiteFooter() {
  const { t, i18n } = useTranslation()
  const isEnglish = i18n.resolvedLanguage?.startsWith('en') ?? true
  const text = (label: { id: string; en: string }) => (isEnglish ? label.en || label.id : label.id)
  const { footer } = useSiteSettings().headerFooter
  const { pathname } = useLocation()
  const whatsappUrl = `https://wa.me/${footer.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(defaultContactMessage)}`

  return (
    <footer className="mt-auto border-t border-white/10 bg-secondary px-5 py-12 text-white lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand statement */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link className="inline-block outline-none focus-visible:ring-2 focus-visible:ring-primary" to="/">
            <img alt="Attentive.id" className="h-auto w-36" height="144" loading="lazy" src="/images/figma/attentive-logo.webp" width="528" />
          </Link>
          <p className="mt-3 max-w-xs text-xs font-[450] leading-relaxed text-white/80">{text(footer.statement)}</p>
        </div>

        {/* Explore Links */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{text(footer.exploreHeading)}</h2>
          <div className="mt-3 grid gap-1.5 text-xs font-medium text-white/80">
            {footer.exploreLinks.filter((link) => link.visible).map((link) => (
              <SiteLink className="inline-flex min-h-7 items-center hover:text-white" key={link.id} url={link.url}>
                {text(link.label)}
              </SiteLink>
            ))}
          </div>
        </div>

        {/* Location Linked Titles */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            {text(footer.locationsHeading)}
          </h2>
          <div className="mt-3 grid gap-1.5 text-xs font-medium text-white/80">
            {clinicBranches.map((branch) => {
              const isOpeningSoon = branch.status === 'opening_soon'
              const displayName = branch.name.replace(/^Attentive\s+/, '')
              return (
                <a
                  key={branch.id}
                  className="inline-flex min-h-7 items-center gap-1.5 hover:text-white"
                  href={branch.mapsUrl && !isOpeningSoon ? branch.mapsUrl : '/#locations'}
                  rel={branch.mapsUrl && !isOpeningSoon ? 'noopener noreferrer' : undefined}
                  target={branch.mapsUrl && !isOpeningSoon ? '_blank' : undefined}
                >
                  <span className="hover:underline">{displayName}</span>
                  {isOpeningSoon ? (
                    <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[0.625rem] font-semibold text-primary">
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
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            {text(footer.contactHeading)}
          </h2>
          <div className="mt-3 grid gap-1.5 text-xs font-medium text-white/80">
            {footer.whatsappNumber && (
              <a className="inline-flex min-h-7 items-center gap-2 hover:text-white" href={whatsappUrl} rel="noopener noreferrer" target="_blank">
                <MessageCircle aria-hidden="true" className="size-3.5 text-primary" />
                <span>{footer.whatsappNumber}</span>
              </a>
            )}
            {footer.instagramUrl && (
              <a className="inline-flex min-h-7 items-center gap-2 hover:text-white" href={footer.instagramUrl} rel="noopener noreferrer" target="_blank">
                <Instagram aria-hidden="true" className="size-3.5 text-primary" />
                <span>{footer.instagramLabel || 'Instagram'}</span>
              </a>
            )}
            {footer.linkedinUrl && (
              <a className="inline-flex min-h-7 items-center gap-2 hover:text-white" href={footer.linkedinUrl} rel="noopener noreferrer" target="_blank">
                <Linkedin aria-hidden="true" className="size-3.5 text-primary" />
                <span>{footer.linkedinLabel || 'LinkedIn'}</span>
              </a>
            )}
            {footer.email && (
              <a className="inline-flex min-h-7 items-center gap-2 hover:text-white" href={`mailto:${footer.email}`}>
                <Mail aria-hidden="true" className="size-3.5 text-primary" />
                <span>{footer.email}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-7xl flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-[0.7rem] font-medium text-white/60">
        <p>
          © {new Date().getFullYear()} {text(footer.copyright)}
        </p>
        <Link className="inline-flex min-h-7 items-center underline hover:text-white" to={`/feedback?from=${encodeURIComponent(pathname)}`}>
          {isEnglish ? 'Report a bug or suggest something' : 'Laporkan bug atau beri saran'}
        </Link>
      </div>
    </footer>
  )
}
