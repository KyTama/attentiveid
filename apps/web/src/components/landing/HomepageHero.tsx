import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowRight, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { INTERACTIVE_SPRING } from '@/lib/motion'

interface TrustMetric {
  label: string
  value: string
}

export function HomepageHero() {
  const { t } = useTranslation()
  const metrics = t('homepage.hero.metrics', { returnObjects: true }) as TrustMetric[]

  return (
    <section className="relative border-b border-secondary/10" id="home">
      <div className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl items-stretch lg:grid-cols-[1.02fr_0.98fr]">
        <div className="min-w-0 flex flex-col justify-center px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <h1
            className="max-w-3xl text-balance font-sans text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-secondary outline-none"
            data-route-heading
            tabIndex={-1}
          >
            {t('homepage.hero.title')}
          </h1>
          <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-secondary/65 sm:text-lg">
            {t('homepage.hero.description')}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <motion.div transition={INTERACTIVE_SPRING} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
              <Link
                className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-secondary px-6 py-4 font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto"
                to="/psychologists"
              >
                {t('homepage.hero.primaryAction')}
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
            </motion.div>
            <motion.a
              className="inline-flex items-center justify-center gap-3 rounded-full border border-secondary/20 px-6 py-4 font-semibold text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              href="#support"
              transition={INTERACTIVE_SPRING}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('homepage.hero.secondaryAction')}
              <ArrowDownRight aria-hidden="true" size={18} />
            </motion.a>
          </div>
          <p className="mt-6 text-sm text-secondary/50">{t('homepage.hero.reassurance')}</p>
        </div>

        <div className="relative min-w-0 min-h-[34rem] overflow-hidden bg-[#ded8cd] lg:min-h-full">
          <img
            alt={t('homepage.hero.imageAlt')}
            className="absolute inset-0 h-full w-full object-cover object-top"
            decoding="async"
            fetchPriority="high"
            height="750"
            src="/images/psychologists/Syazka.webp"
            width="600"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-secondary/45 to-transparent" />
          <div className="absolute bottom-6 left-5 right-5 rounded-3xl bg-[#fbf8f2]/94 p-5 shadow-[0_18px_45px_rgba(20,44,82,0.2)] backdrop-blur-md sm:left-auto sm:right-7 sm:w-72">
            <div className="flex items-center gap-2 text-primary">
              <Star aria-hidden="true" fill="currentColor" size={16} />
              <span className="text-sm font-bold text-secondary">{t('homepage.hero.imageCardTitle')}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-secondary/65">{t('homepage.hero.imageCardBody')}</p>
          </div>
        </div>
      </div>

      <dl className="mx-auto grid max-w-7xl grid-cols-2 border-x border-secondary/10 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div className="min-w-0 border-b border-r border-secondary/10 px-4 py-8 sm:border-b-0 sm:px-5 lg:px-8" key={metric.label}>
            <dt className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-secondary/50">{metric.label}</dt>
            <dd className="order-first text-4xl font-semibold tracking-[-0.03em] text-secondary">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
