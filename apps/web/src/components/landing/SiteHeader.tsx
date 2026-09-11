import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useIntakeModal } from '@/components/intake'

const navItems = [
  { key: 'support', href: '/#support' },
  { key: 'psychologists', href: '/#psychologists' },
  { key: 'articles', href: '/articles' },
  { key: 'process', href: '/#process' },
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
      className="min-h-11 min-w-11 rounded-md border border-secondary/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      onClick={() => i18n.changeLanguage(isEnglish ? 'id' : 'en')}
      transition={INTERACTIVE_SPRING}
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
    >
      {languageCode}
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
      className="sticky top-0 z-50 border-b border-secondary/10 bg-[#fbf8f2]/95 backdrop-blur-xl"
      initial={false}
      layout
      transition={INTERACTIVE_SPRING}
    >
      <nav aria-label={t('homepage.nav.label')} className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary" to="/">
          <img alt="Attentive.id" className="h-auto w-36 sm:w-44" height="144" src="/images/figma/attentive-logo.webp" width="528" />
        </Link>

        <div className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) => {
            const isInternal = !item.href.includes('#')
            if (isInternal) {
              return (
                <motion.div key={item.key} transition={INTERACTIVE_SPRING} whileHover={{ y: -2 }}>
                  <Link
                    className="inline-flex min-h-11 items-center text-sm font-medium text-secondary/75 outline-none hover:text-[#946a22] focus-visible:text-secondary focus-visible:ring-2 focus-visible:ring-primary"
                    to={item.href}
                  >
                    {t(`homepage.nav.${item.key}`)}
                  </Link>
                </motion.div>
              )
            }
            return (
              <motion.a
                className="inline-flex min-h-11 items-center text-sm font-medium text-secondary/75 outline-none focus-visible:text-secondary focus-visible:ring-2 focus-visible:ring-primary"
                href={item.href}
                key={item.key}
                transition={INTERACTIVE_SPRING}
                whileHover={{ color: '#946a22', y: -2 }}
              >
                {t(`homepage.nav.${item.key}`)}
              </motion.a>
            )
          })}
          <LanguageToggle />
          <motion.div transition={INTERACTIVE_SPRING} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
            <button
              type="button"
              onClick={() => openIntake()}
              className="inline-flex rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer shadow-sm"
            >
              {t('intakeDialog.title')}
            </button>
          </motion.div>
          <motion.div transition={INTERACTIVE_SPRING} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
            <Link
              className="inline-flex rounded-md bg-secondary px-4 py-2.5 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              to="/psychologists"
            >
              {t('homepage.nav.find')}
            </Link>
          </motion.div>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle />
          <motion.button
            aria-controls="homepage-mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t('homepage.nav.closeMenu') : t('homepage.nav.openMenu')}
            className="grid size-11 place-items-center rounded-md bg-secondary text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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

      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden border-t border-secondary/10 bg-[#fbf8f2] lg:hidden"
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
            <div className="mx-auto grid max-w-7xl gap-2 px-5 py-5">
              {navItems.map((item) => {
                const isInternal = !item.href.includes('#')
                if (isInternal) {
                  return (
                    <Link
                      className="rounded-xl px-4 py-3 text-base font-semibold text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      key={item.key}
                      onClick={() => setMenuOpen(false)}
                      to={item.href}
                    >
                      {t(`homepage.nav.${item.key}`)}
                    </Link>
                  )
                }
                return (
                  <a
                    className="rounded-xl px-4 py-3 text-base font-semibold text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    href={item.href}
                    key={item.key}
                    onClick={() => setMenuOpen(false)}
                  >
                    {t(`homepage.nav.${item.key}`)}
                  </a>
                )
              })}
              <button
                type="button"
                className="mt-2 rounded-md bg-primary px-5 py-4 text-center font-semibold text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shadow-sm"
                onClick={() => {
                  setMenuOpen(false)
                  openIntake()
                }}
              >
                {t('intakeDialog.title')}
              </button>
              <Link
                className="mt-2 rounded-md bg-secondary px-5 py-4 text-center font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setMenuOpen(false)}
                to="/psychologists"
              >
                {t('homepage.nav.find')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
