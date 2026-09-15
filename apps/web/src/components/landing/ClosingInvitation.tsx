import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { createWhatsAppLink, defaultContactMessage } from '@/data/contact'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useLandingSection } from '@/features/content/landing-content-context'
import { useIntakeModal } from '@/components/intake'

export function ClosingInvitation() {
  const { t } = useTranslation()
  const { openIntake } = useIntakeModal()
  const managed = useLandingSection('closingInvitation')
  const whatsappUrl = createWhatsAppLink(defaultContactMessage)

  return (
    <section className="deferred-section relative overflow-hidden bg-secondary px-5 py-20 text-white lg:px-8 lg:py-28">
      <img alt="" className="pointer-events-none absolute bottom-0 right-0 h-full w-1/2 object-contain object-right opacity-30 lg:opacity-100" height="614" loading="lazy" src="/images/figma/closing-landscape.webp" width="680" />
      <div className="relative mx-auto max-w-7xl">
        <h2 className="max-w-2xl text-balance text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl">{managed?.section.headline[managed.locale] ?? t('homepage.closing.title')}</h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed font-[450] text-white sm:text-lg">{managed?.section.description[managed.locale] ?? t('homepage.closing.description')}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <motion.div transition={INTERACTIVE_SPRING} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
            <button
              type="button"
              onClick={() => openIntake()}
              className="inline-flex w-full justify-center rounded-md bg-primary px-6 py-4 font-semibold text-secondary sm:w-auto cursor-pointer"
            >
              {t('intakeDialog.title')}
            </button>
          </motion.div>
          <motion.div transition={INTERACTIVE_SPRING} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
            <Link className="inline-flex w-full justify-center rounded-md border border-white/25 px-6 py-4 font-semibold text-white sm:w-auto" to="/psychologists">
              {managed?.section.primaryCta[managed.locale] ?? t('homepage.closing.primaryAction')}
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
            {managed?.section.contact[managed.locale] ?? t('homepage.closing.secondaryAction')}
          </motion.a>
        </div>
      </div>
    </section>
  )
}
