import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { INTERACTIVE_SPRING } from '@/lib/motion'

const navItems = [
  { key: 'psychologists', href: '/#psychologists' },
  { key: 'locations', href: '/#locations' },
  { key: 'faq', href: '/#faq' },
] as const

const productItems = [
  { key: 'service', href: '/#support' },
  { key: 'sciBrief', href: '/sci-brief' },
  { key: 'article', href: '/articles' },
] as const

type ClickHandler = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => void

function ProductsMenu({ onAnchorClick }: { onAnchorClick: ClickHandler }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

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
    'block rounded-lg px-3.5 py-2.5 text-sm font-medium text-secondary/80 outline-none transition-colors hover:bg-black/[0.04] hover:text-secondary focus-visible:bg-black/[0.05]'

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
        {t('homepage.nav.products')}
        <ChevronDown aria-hidden="true" className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} size={15} />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2" id={menuId}>
          <ul className="min-w-44 rounded-xl border border-secondary/10 bg-white p-1.5 shadow-lg">
            {productItems.map((item) => (
              <li key={item.key}>
                {item.href.includes('#') ? (
                  <a
                    className={itemClass}
                    href={item.href}
                    onClick={(event) => {
                      setOpen(false)
                      onAnchorClick(event, item.href)
                    }}
                  >
                    {t(`homepage.nav.${item.key}`)}
                  </a>
                ) : (
                  <Link className={itemClass} onClick={() => setOpen(false)} to={item.href}>
                    {t(`homepage.nav.${item.key}`)}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function MobileProducts({ onNavigate, onAnchorClick }: { onNavigate: () => void; onAnchorClick: ClickHandler }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const rowClass =
    'flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold text-secondary transition-colors hover:bg-black/[0.03] outline-none focus-visible:ring-2 focus-visible:ring-primary'

  return (
    <div>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className={`${rowClass} w-full cursor-pointer`}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span>{t('homepage.nav.products')}</span>
        <ChevronDown aria-hidden="true" className={`text-secondary/40 transition-transform ${open ? 'rotate-180' : ''}`} size={16} />
      </button>
      {open && (
        <ul className="mb-1 ml-3 border-l border-secondary/10 pl-2" id={panelId}>
          {productItems.map((item) => (
            <li key={item.key}>
              {item.href.includes('#') ? (
                <a
                  className={rowClass}
                  href={item.href}
                  onClick={(event) => {
                    onNavigate()
                    onAnchorClick(event, item.href)
                  }}
                >
                  <span>{t(`homepage.nav.${item.key}`)}</span>
                </a>
              ) : (
                <Link className={rowClass} onClick={onNavigate} to={item.href}>
                  <span>{t(`homepage.nav.${item.key}`)}</span>
                </Link>
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname === '/' && href.startsWith('/#')) {
      e.preventDefault()
      const targetId = href.replace('/#', '')
      const targetEl = document.getElementById(targetId)
      if (targetEl) {
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
          <ProductsMenu onAnchorClick={handleNavClick} />
          {navItems.map((item) => {
            const isInternal = !item.href.includes('#')
            if (isInternal) {
              return (
                <Link
                  className="rounded-md py-1 text-sm font-medium text-secondary/75 transition-colors duration-150 hover:text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  key={item.key}
                  to={item.href}
                >
                  {t(`homepage.nav.${item.key}`)}
                </Link>
              )
            }
            return (
              <a
                className="rounded-md py-1 text-sm font-medium text-secondary/75 transition-colors duration-150 hover:text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary"
                href={item.href}
                key={item.key}
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {t(`homepage.nav.${item.key}`)}
              </a>
            )
          })}
        </div>

        {/* Desktop Actions & Single Primary CTA */}
        <div className="hidden items-center gap-4 lg:flex">
          <LanguageToggle />

          <motion.a
            href="https://booking.attentiveid.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-secondary shadow-xs transition-colors hover:bg-[#ffcf4d] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
            transition={INTERACTIVE_SPRING}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            {t('homepage.nav.headerCta')}
          </motion.a>
        </div>

        {/* Mobile Header Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle />
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
                <MobileProducts onAnchorClick={handleNavClick} onNavigate={() => setMenuOpen(false)} />
                {navItems.map((item) => {
                  const isInternal = !item.href.includes('#')
                  if (isInternal) {
                    return (
                      <Link
                        className="flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold text-secondary transition-colors hover:bg-black/[0.03] outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        key={item.key}
                        onClick={() => setMenuOpen(false)}
                        to={item.href}
                      >
                        <span>{t(`homepage.nav.${item.key}`)}</span>
                        <ChevronRight aria-hidden="true" className="text-secondary/40" size={16} />
                      </Link>
                    )
                  }
                  return (
                    <a
                      className="flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold text-secondary transition-colors hover:bg-black/[0.03] outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      href={item.href}
                      key={item.key}
                      onClick={(e) => {
                        setMenuOpen(false)
                        handleNavClick(e, item.href)
                      }}
                    >
                      <span>{t(`homepage.nav.${item.key}`)}</span>
                      <ChevronRight aria-hidden="true" className="text-secondary/40" size={16} />
                    </a>
                  )
                })}
              </nav>

              <div className="mt-2">
                <a
                  href="https://booking.attentiveid.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-full bg-primary px-5 py-3.5 text-center font-bold text-secondary shadow-xs transition-colors hover:bg-[#ffcf4d] outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('homepage.nav.headerCta')}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
