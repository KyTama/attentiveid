import { motion } from 'framer-motion'
import { Building2, Check, MessageCircle, Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createWhatsAppLink, defaultContactMessage } from '@/data/contact'
import { INTERACTIVE_SPRING } from '@/lib/motion'

export function ConsultationReassurance() {
  const { t } = useTranslation()
  const included = t('homepage.pricing.included', { returnObjects: true }) as string[]
  const whatsappUrl = createWhatsAppLink(defaultContactMessage)

  return (
    <section className="px-5 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.5rem] bg-[#eee5d8] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="p-7 sm:p-12 lg:p-16">
          <h2 className="max-w-2xl text-balance text-4xl font-semibold tracking-[-0.03em] text-secondary sm:text-5xl">{t('homepage.pricing.title')}</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-secondary/65">{t('homepage.pricing.description')}</p>
          <div className="mt-10 rounded-3xl bg-white/70 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-secondary/45">{t('homepage.pricing.sessionLabel')}</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-secondary">{t('homepage.pricing.price')}</p>
            <p className="mt-1 text-sm text-secondary/50">{t('homepage.pricing.perSession')}</p>
            <ul className="mt-7 grid gap-3">
              {included.map((item) => (
                <li className="flex gap-3 text-sm text-secondary/70" key={item}>
                  <Check aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={16} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid content-center gap-5 bg-secondary p-7 text-white sm:p-12 lg:p-14">
          <div className="rounded-3xl border border-white/15 p-6">
            <Video aria-hidden="true" className="text-primary" size={26} />
            <h3 className="mt-6 text-2xl font-semibold">{t('homepage.pricing.onlineTitle')}</h3>
            <p className="mt-3 text-sm leading-6 text-white/60">{t('homepage.pricing.onlineDescription')}</p>
          </div>
          <div className="rounded-3xl border border-white/15 p-6">
            <Building2 aria-hidden="true" className="text-primary" size={26} />
            <h3 className="mt-6 text-2xl font-semibold">{t('homepage.pricing.offlineTitle')}</h3>
            <p className="mt-3 text-sm leading-6 text-white/60">{t('homepage.pricing.offlineDescription')}</p>
          </div>
          <motion.a
            className="mt-2 inline-flex items-center justify-center gap-3 rounded-full bg-primary px-6 py-4 font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-white"
            href={whatsappUrl}
            rel="noopener noreferrer"
            target="_blank"
            transition={INTERACTIVE_SPRING}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageCircle aria-hidden="true" size={18} />
            {t('homepage.pricing.action')}
          </motion.a>
        </div>
      </div>
    </section>
  )
}

