import { motion } from 'framer-motion'
import { ArrowDown, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createWhatsAppLink, defaultContactMessage } from '@/data/contact'
import { INTERACTIVE_SPRING } from '@/lib/motion'

export function PsychologistDirectoryReassurance() {
  const { t } = useTranslation()
  const whatsappUrl = createWhatsAppLink(defaultContactMessage)

  return (
    <>
      <section className="bg-[#f3ede3] px-5 py-20 text-center lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{t('routes.psychologists.comparison.eyebrow')}</p>
          <h2 className="mt-4 text-[2rem] font-semibold tracking-[-0.03em] text-secondary sm:text-balance sm:text-5xl">
            {t('routes.psychologists.comparison.title')}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-secondary/60">{t('routes.psychologists.comparison.description')}</p>
          <motion.a
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-4 font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            href="#finder"
            transition={INTERACTIVE_SPRING}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('routes.psychologists.comparison.action')}
            <ArrowDown aria-hidden="true" size={18} />
          </motion.a>
        </div>
      </section>

      <section className="relative overflow-hidden bg-secondary px-5 py-20 text-white lg:px-8 lg:py-24">
        <div aria-hidden="true" className="absolute -bottom-40 right-0 size-[30rem] rounded-full border border-primary/20" />
        <div aria-hidden="true" className="absolute -bottom-24 right-20 size-[20rem] rounded-full border border-primary/20" />
        <div className="relative mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{t('routes.psychologists.help.eyebrow')}</p>
            <h2 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{t('routes.psychologists.help.title')}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/65">{t('routes.psychologists.help.description')}</p>
          </div>
          <motion.a
            className="inline-flex items-center justify-center gap-3 rounded-full bg-primary px-6 py-4 font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-white"
            href={whatsappUrl}
            rel="noopener noreferrer"
            target="_blank"
            transition={INTERACTIVE_SPRING}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageCircle aria-hidden="true" size={18} />
            {t('routes.psychologists.help.action')}
          </motion.a>
        </div>
      </section>
    </>
  )
}
