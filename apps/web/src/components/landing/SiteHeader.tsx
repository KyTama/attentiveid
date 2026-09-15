import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronRight, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useIntakeModal } from '@/components/intake'

const navItems = [
  { key: 'support', href: '/#support' },
  { key: 'find', href: '/psychologists' },
  { key: 'locations', href: '/#locations' },
  { key: 'articles', href: '/articles' },
  { key: 'faq', href: '/#faq' },
] as const

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
  const { openIntake } = useIntakeModal()
  const [menuOpen, setMenuOpen] = useState(false)
  const reduceMotion = useReducedMotion()

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
              >
                {t(`homepage.nav.${item.key}`)}
              </a>
            )
          })}
        </div>

        {/* Desktop Actions & Single Primary CTA */}
        <div className="hidden items-center gap-4 lg:flex">
          <LanguageToggle />

          <motion.button
            type="button"
            onClick={() => openIntake()}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-secondary shadow-xs transition-colors hover:bg-[#ffcf4d] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
            transition={INTERACTIVE_SPRING}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            {t('intakeDialog.title')}
          </motion.button>
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
                      onClick={() => setMenuOpen(false)}
                    >
                      <span>{t(`homepage.nav.${item.key}`)}</span>
                      <ChevronRight aria-hidden="true" className="text-secondary/40" size={16} />
                    </a>
                  )
                })}
              </nav>

              <div className="mt-2">
                <button
                  type="button"
                  className="w-full rounded-full bg-primary px-5 py-3.5 text-center font-bold text-secondary shadow-xs transition-colors hover:bg-[#ffcf4d] outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                  onClick={() => {
                    setMenuOpen(false)
                    openIntake()
                  }}
                >
                  {t('intakeDialog.title')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
