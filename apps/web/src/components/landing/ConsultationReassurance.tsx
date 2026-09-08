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
    <section className="relative overflow-hidden bg-[#fcf8f1] px-5 py-20 lg:px-8 lg:py-28">
      <div aria-hidden="true" className="absolute left-1/2 top-8 size-72 -translate-x-1/2 rounded-full border border-primary/10" />
      <div aria-hidden="true" className="absolute left-1/2 top-20 size-48 -translate-x-1/2 rounded-full border border-primary/15" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div aria-hidden="true" className="mb-7 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-primary/70" />
            <span className="size-2 rotate-45 bg-primary" />
            <span className="h-px w-12 bg-primary/70" />
          </div>
          <h2 className="text-balance text-[2rem] font-semibold tracking-[-0.03em] text-secondary sm:text-4xl">{t('homepage.pricing.title')}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-secondary/80">{t('homepage.pricing.description')}</p>
        </div>
        <div className="mt-12 grid overflow-hidden rounded-xl bg-white lg:grid-cols-[1.05fr_0.8fr_0.65fr]">
          <div className="p-7 sm:p-10 lg:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-secondary/80">{t('homepage.pricing.sessionLabel')}</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-secondary">{t('homepage.pricing.price')}</p>
            <p className="mt-1 text-sm text-secondary/80">{t('homepage.pricing.perSession')}</p>
            <ul className="mt-7 grid gap-3">
              {included.map((item) => (
                <li className="flex gap-3 text-sm text-secondary/70" key={item}>
                  <Check aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={16} />
                  {item}
                </li>
              ))}
            </ul>
            <motion.a
              className="mt-9 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-md bg-primary px-6 py-4 text-sm font-semibold text-secondary outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 sm:w-auto"
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
          <div className="grid content-center gap-8 border-t border-white/15 bg-secondary p-7 text-white sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
            <div>
              <Video aria-hidden="true" className="text-primary" size={26} />
              <h3 className="mt-5 text-xl font-semibold">{t('homepage.pricing.onlineTitle')}</h3>
              <p className="mt-3 text-sm leading-6 text-white/80">{t('homepage.pricing.onlineDescription')}</p>
            </div>
            <div className="border-t border-white/15 pt-8">
              <Building2 aria-hidden="true" className="text-primary" size={26} />
              <h3 className="mt-5 text-xl font-semibold">{t('homepage.pricing.offlineTitle')}</h3>
              <p className="mt-3 text-sm leading-6 text-white/80">{t('homepage.pricing.offlineDescription')}</p>
            </div>
          </div>
          <figure className="relative min-h-[24rem] overflow-hidden bg-[#d9c1a4] lg:min-h-full">
            <img alt={t('homepage.pricing.imageAlt')} className="absolute inset-0 h-full w-full object-cover object-center" height="259" loading="lazy" src="/images/figma/session-video.webp" width="366" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-secondary/90 px-6 py-5 text-sm leading-6 text-white">{t('homepage.pricing.imageCaption')}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
