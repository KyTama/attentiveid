import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowRight } from 'lucide-react'
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
      <div className="mx-auto grid min-h-[38rem] max-w-7xl items-stretch lg:grid-cols-[0.95fr_1.05fr]">
        <div className="min-w-0 flex flex-col justify-center px-5 py-16 sm:px-8 lg:px-8 lg:py-20">
          <h1
            className="max-w-3xl text-balance font-sans text-[clamp(2.5rem,4.3vw,3.75rem)] font-bold leading-[1.12] tracking-[-0.04em] text-secondary outline-none"
            data-route-heading
            tabIndex={-1}
          >
            {t('homepage.hero.title')}
          </h1>
          <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-secondary/80 sm:text-lg">
            {t('homepage.hero.description')}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <motion.div transition={INTERACTIVE_SPRING} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
              <Link
                className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-secondary px-6 py-4 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto"
                to="/psychologists"
              >
                {t('homepage.hero.primaryAction')}
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
            </motion.div>
            <motion.a
              className="inline-flex items-center justify-center gap-3 rounded-md border border-secondary/20 px-6 py-4 text-sm font-semibold text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              href="#support"
              transition={INTERACTIVE_SPRING}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('homepage.hero.secondaryAction')}
              <ArrowDownRight aria-hidden="true" size={18} />
            </motion.a>
          </div>
          <p className="mt-6 text-sm text-secondary/80">{t('homepage.hero.reassurance')}</p>
        </div>

        <div className="relative min-w-0 min-h-[22rem] overflow-hidden rounded-tl-[6rem] bg-[#ded8cd] sm:min-h-[30rem] lg:my-8 lg:min-h-0 lg:rounded-tl-[10rem]">
          <img
            alt={t('homepage.hero.imageAlt')}
            className="absolute inset-0 h-full w-full object-cover object-center"
            decoding="async"
            fetchPriority="high"
            height="901"
            src="/images/figma/consultation-hero.webp"
            width="1600"
          />
        </div>
      </div>

      <dl className="mx-auto grid max-w-7xl grid-cols-2 bg-white py-10 text-center sm:grid-cols-4">
        {metrics.map((metric, metricIndex) => (
          <div className="flex min-w-0 flex-col items-center border-r border-primary/30 px-4 py-6 last:border-r-0 sm:px-5 lg:px-8" key={metric.label}>
            <dt className="order-2 mt-3 text-xs font-semibold text-secondary/75">{metric.label}</dt>
            <dd className="flex flex-col items-center text-4xl font-bold tracking-[-0.03em] text-secondary sm:text-5xl">
              <img alt="" className="mb-4 size-9 object-contain" height="36" loading="lazy" src={`/images/figma/trust-${metricIndex + 1}.svg`} width="36" />
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
