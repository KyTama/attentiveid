import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { createWhatsAppLink, defaultContactMessage } from '@/data/contact'
import { INTERACTIVE_SPRING } from '@/lib/motion'

export function ClosingInvitation() {
  const { t } = useTranslation()
  const whatsappUrl = createWhatsAppLink(defaultContactMessage)

  return (
    <section className="deferred-section relative overflow-hidden bg-secondary px-5 py-24 text-white lg:px-8 lg:py-32">
      <img alt="" className="pointer-events-none absolute bottom-0 right-0 h-full w-1/2 object-contain object-right opacity-30 lg:opacity-100" height="614" loading="lazy" src="/images/figma/closing-landscape.webp" width="680" />
      <div className="relative mx-auto max-w-7xl">
        <h2 className="max-w-2xl text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-5xl">{t('homepage.closing.title')}</h2>
        <p className="mt-6 max-w-xl text-base leading-7 text-white/65">{t('homepage.closing.description')}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <motion.div transition={INTERACTIVE_SPRING} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
            <Link className="inline-flex w-full justify-center rounded-md bg-primary px-6 py-4 font-semibold text-secondary sm:w-auto" to="/psychologists">
              {t('homepage.closing.primaryAction')}
            </Link>
          </motion.div>
          <motion.a
            className="inline-flex justify-center rounded-md border border-white/25 px-6 py-4 font-semibold text-white"
            href={whatsappUrl}
            rel="noopener noreferrer"
            target="_blank"
            transition={INTERACTIVE_SPRING}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('homepage.closing.secondaryAction')}
          </motion.a>
        </div>
      </div>
    </section>
  )
}
