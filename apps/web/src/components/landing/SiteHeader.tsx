import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import type { MenuItem } from '@attentiveid/shared'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { CatToggle } from '@/components/common/CatToggle'
import { useSiteSettings } from '@/features/site-settings/use-site-settings'
import { SiteLink } from './SiteLink'

const desktopLinkClass =
  'rounded-md py-1 text-sm font-medium text-secondary/75 transition-colors duration-150 hover:text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary'
/** "Our Services" keeps its stronger look. */
const desktopStrongClass =
  'rounded-md py-1 text-sm font-medium text-secondary transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary'
const mobileRowClass =
  'flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold text-secondary transition-colors hover:bg-black/[0.03] outline-none focus-visible:ring-2 focus-visible:ring-primary'

/** Indonesian or English text of an editable entry. */
function useLabel() {
  const { i18n } = useTranslation()
  const isEnglish = i18n.resolvedLanguage?.startsWith('en') ?? true
  return (label: { id: string; en: string }) => (isEnglish ? label.en || label.id : label.id)
}

function DropdownMenu({ item }: { item: MenuItem }) {
  const { t } = useTranslation()
  const text = useLabel()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        rootRef.current?.querySelector('button')?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const itemClass =
    'block whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-medium text-secondary/80 outline-none transition-colors hover:bg-black/[0.04] hover:text-secondary focus-visible:bg-black/[0.05]'

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-1 rounded-md py-1 text-sm font-medium text-secondary/75 outline-none transition-colors duration-150 hover:text-secondary focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {text(item.label)}
        <ChevronDown aria-hidden="true" className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} size={15} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2"
            exit={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : -4 }}
            id={menuId}
            initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : -4 }}
            transition={INTERACTIVE_SPRING}
          >
            <ul className="min-w-60 rounded-xl border border-secondary/10 bg-white p-1.5 shadow-lg">
              {item.children.filter((child) => child.visible).map((child) => (
                <li key={child.id}>
                  {child.comingSoon ? (
                    <div
                      aria-disabled="true"
                      className="flex items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-medium text-secondary/45 cursor-not-allowed select-none"
                    >
                      <span>{text(child.label)}</span>
                      <span className="shrink-0 rounded-full bg-secondary/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary/60">
                        {t('homepage.nav.comingSoon')}
                      </span>
                    </div>
                  ) : (
                    <SiteLink className={itemClass} onNavigate={() => setOpen(false)} url={child.url}>
                      {text(child.label)}
                    </SiteLink>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MobileDropdown({ item, onNavigate }: { item: MenuItem; onNavigate: () => void }) {
  const { t } = useTranslation()
  const text = useLabel()
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <div>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className={`${mobileRowClass} w-full cursor-pointer`}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span>{text(item.label)}</span>
        <ChevronDown aria-hidden="true" className={`text-secondary/40 transition-transform ${open ? 'rotate-180' : ''}`} size={16} />
      </button>
      {open && (
        <ul className="mb-1 ml-3 border-l border-secondary/10 pl-2" id={panelId}>
          {item.children.filter((child) => child.visible).map((child) => (
            <li key={child.id}>
              {child.comingSoon ? (
                <div
                  aria-disabled="true"
                  className="flex items-center justify-between gap-2 rounded-xl px-4 py-3.5 text-base font-semibold text-secondary/45 cursor-not-allowed select-none"
                >
                  <span>{text(child.label)}</span>
                  <span className="shrink-0 rounded-full bg-secondary/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary/60">
                    {t('homepage.nav.comingSoon')}
                  </span>
                </div>
              ) : (
                <SiteLink className={mobileRowClass} onNavigate={onNavigate} url={child.url}>
                  <span>{text(child.label)}</span>
                </SiteLink>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function LanguageToggle() {
  const { i18n, t } = useTranslation()
  const isEnglish = i18n.resolvedLanguage?.startsWith('en') ?? true
  const targetLanguage = isEnglish ? 'Bahasa Indonesia' : 'English'
  const languageCode = isEnglish ? 'ID' : 'EN'

  return (
    <motion.button
      aria-label={`${languageCode} — ${t('homepage.nav.languageSwitch', { language: targetLanguage })}`}
      className="relative inline-flex items-center gap-0.5 rounded-full border border-secondary/15 bg-white/80 p-1 text-[11px] font-bold tracking-wider text-secondary shadow-2xs outline-none backdrop-blur-xs transition-colors hover:border-secondary/30 hover:bg-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
      onClick={() => i18n.changeLanguage(isEnglish ? 'id' : 'en')}
      transition={INTERACTIVE_SPRING}
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
    >
      <span
        className={`rounded-full px-2 py-0.5 transition-colors ${
          isEnglish ? 'bg-secondary text-white shadow-2xs' : 'text-secondary/50 hover:text-secondary'
        }`}
      >
        EN
      </span>
      <span
        className={`rounded-full px-2 py-0.5 transition-colors ${
          !isEnglish ? 'bg-secondary text-white shadow-2xs' : 'text-secondary/50 hover:text-secondary'
        }`}
      >
        ID
      </span>
    </motion.button>
  )
}

export function SiteHeader() {
  const { t } = useTranslation()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const text = useLabel()
  const { header } = useSiteSettings().headerFooter
  const menu = header.items.filter((item) => item.visible)

  /** A section link on the homepage scrolls there instead of reloading. */
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname === '/' && href.startsWith('/#')) {
      const targetEl = document.getElementById(href.replace('/#', ''))
      if (targetEl) {
        e.preventDefault()
        targetEl.scrollIntoView({ behavior: 'smooth' })
        window.history.pushState(null, '', href)
      }
    }
  }

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-secondary/10 bg-[#fbf8f2]/95 backdrop-blur-xl transition-shadow duration-200 shadow-2xs"
      initial={false}
      layout
      transition={INTERACTIVE_SPRING}
    >
      <nav aria-label={t('homepage.nav.label')} className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link className="flex items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary" to="/">
          <img alt="Attentive.id" className="h-auto w-36 sm:w-40" height="144" src="/images/figma/attentive-logo.webp" width="528" />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-6 xl:gap-8 lg:flex">
          {menu.map((item) =>
            item.children.length > 0 ? (
              <DropdownMenu item={item} key={item.id} />
            ) : (
              <SiteLink
                className={item.id === 'our-services' ? desktopStrongClass : desktopLinkClass}
                key={item.id}
                onAnchorClick={handleNavClick}
                url={item.url}
              >
                {text(item.label)}
              </SiteLink>
            ),
          )}
        </div>

        {/* Desktop Actions & Single Primary CTA */}
        <div className="hidden items-center gap-4 lg:flex">
          <div className="flex items-center gap-2">
            <CatToggle />
            <LanguageToggle />
          </div>

          {header.cta.visible && (
            <motion.div transition={INTERACTIVE_SPRING} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <SiteLink
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-secondary shadow-xs transition-colors hover:bg-[#ffcf4d] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
                url={header.cta.url}
              >
                {text(header.cta.label)}
              </SiteLink>
            </motion.div>
          )}
        </div>

        {/* Mobile Header Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex items-center gap-2">
            <CatToggle />
            <LanguageToggle />
          </div>
          <motion.button
            aria-controls="homepage-mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t('homepage.nav.closeMenu') : t('homepage.nav.openMenu')}
            className="grid size-11 place-items-center rounded-full border border-secondary/15 bg-white/80 text-secondary shadow-2xs outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={() => setMenuOpen((current) => !current)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setMenuOpen(false)
            }}
            transition={INTERACTIVE_SPRING}
            type="button"
            whileTap={{ scale: 0.92 }}
          >
            {menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
          </motion.button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden border-t border-secondary/10 bg-[#fbf8f2] lg:hidden shadow-lg"
            exit={{ height: 0, opacity: reduceMotion ? 1 : 0 }}
            id="homepage-mobile-menu"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setMenuOpen(false)
                document.querySelector<HTMLButtonElement>('[aria-controls="homepage-mobile-menu"]')?.focus()
              }
            }}
            initial={{ height: 0, opacity: reduceMotion ? 1 : 0 }}
            transition={INTERACTIVE_SPRING}
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6">
              <nav className="flex flex-col divide-y divide-secondary/10 rounded-2xl border border-secondary/10 bg-white/80 p-1.5 shadow-2xs">
                {menu.map((item) =>
                  item.children.length > 0 ? (
                    <MobileDropdown item={item} key={item.id} onNavigate={() => setMenuOpen(false)} />
                  ) : (
                    <SiteLink
                      className={mobileRowClass}
                      key={item.id}
                      onAnchorClick={handleNavClick}
                      onNavigate={() => setMenuOpen(false)}
                      url={item.url}
                    >
                      <span>{text(item.label)}</span>
                      {item.url.includes('#') && <ChevronRight aria-hidden="true" className="text-secondary/40" size={16} />}
                    </SiteLink>
                  ),
                )}
              </nav>

              {header.cta.visible && (
                <div className="mt-2">
                  <SiteLink
                    className="block w-full rounded-full bg-primary px-5 py-3.5 text-center font-bold text-secondary shadow-xs transition-colors hover:bg-[#ffcf4d] outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                    onNavigate={() => setMenuOpen(false)}
                    url={header.cta.url}
                  >
                    {text(header.cta.label)}
                  </SiteLink>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
